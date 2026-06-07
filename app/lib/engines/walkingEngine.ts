// ── Konstantet ────────────────────────────────────────────────────────────────
const DEFAULT_WALKING_SPEED_KMH = 5.0;
const PEDESTRIAN_CURVATURE_FACTOR = 1.414;
const EARTH_RADIUS_METERS = 6_371_000;
const FETCH_TIMEOUT_MS = 8_000;

// ── Tipet ─────────────────────────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

export interface WalkingRouteResult {
  provider: string;
  distanceMeters: number;
  durationSeconds: number;
  polyline: string;
  waypoints: [number, number][];
}

export interface WalkingEngineConfig {
  googleApiKey?: string;
  mapboxAccessToken?: string;
  osrmBaseUrl?: string;
}

type ProviderKey = 'GOOGLE' | 'MAPBOX' | 'OSRM';

interface ProviderConfig {
  key: ProviderKey;
  enabled: boolean;
  fetch: (origin: LatLng, destination: LatLng) => Promise<WalkingRouteResult>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Fetch me timeout — parandalon varje pafundësisht */
async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}

function isValidLatLng(point: LatLng): boolean {
  return (
    typeof point.lat === 'number' && point.lat >= -90 && point.lat <= 90 &&
    typeof point.lng === 'number' && point.lng >= -180 && point.lng <= 180
  );
}

// ── Engine ────────────────────────────────────────────────────────────────────
export class WalkingEngine {
  private readonly providers: ProviderConfig[];

  constructor(config: WalkingEngineConfig = {}) {
    const googleApiKey = config.googleApiKey ?? process.env.GOOGLE_MAPS_API_KEY ?? '';
    const mapboxAccessToken = config.mapboxAccessToken ?? process.env.MAPBOX_ACCESS_TOKEN ?? '';
    const osrmBaseUrl = config.osrmBaseUrl ?? 'https://router.project-osrm.org';

    // Providers si tabelë — shto/hiq pa prekur logjikën kryesore
    this.providers = [
      {
        key: 'GOOGLE',
        enabled: Boolean(googleApiKey),
        fetch: (o, d) => this.fetchGoogle(o, d, googleApiKey),
      },
      {
        key: 'MAPBOX',
        enabled: Boolean(mapboxAccessToken),
        fetch: (o, d) => this.fetchMapbox(o, d, mapboxAccessToken),
      },
      {
        key: 'OSRM',
        enabled: true,
        fetch: (o, d) => this.fetchOsrm(o, d, osrmBaseUrl),
      },
    ];
  }

  async calculateWalkingRoute(
    origin: LatLng,
    destination: LatLng,
    providerPriority: ProviderKey[] = ['GOOGLE', 'MAPBOX', 'OSRM']
  ): Promise<WalkingRouteResult> {
    if (!isValidLatLng(origin) || !isValidLatLng(destination)) {
      throw new Error('Koordinatat e origjinës ose destinacionit janë të pavlefshme.');
    }

    const ordered = providerPriority
      .map(key => this.providers.find(p => p.key === key))
      .filter((p): p is ProviderConfig => Boolean(p?.enabled));

    for (const provider of ordered) {
      try {
        const res = await provider.fetch(origin, destination);
        if (res && res.waypoints && res.waypoints.length > 0) {
          const first = res.waypoints[0];
          const last = res.waypoints[res.waypoints.length - 1];
          const originCoords: [number, number] = [origin.lat, origin.lng];
          const destCoords: [number, number] = [destination.lat, destination.lng];

          let newWaypoints = [...res.waypoints];

          const distToFirst = Math.pow(first[0] - origin.lat, 2) + Math.pow(first[1] - origin.lng, 2);
          if (distToFirst > 1e-9) {
            newWaypoints.unshift(originCoords);
          }

          const distToLast = Math.pow(last[0] - destination.lat, 2) + Math.pow(last[1] - destination.lng, 2);
          if (distToLast > 1e-9) {
            newWaypoints.push(destCoords);
          }

          res.waypoints = newWaypoints;
        }
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`WalkingEngine: ${provider.key} dështoi — ${message}. Duke provuar fallback...`);
      }
    }

    return this.haversineFallback(origin, destination);
  }

  // ── Provider fetchers ──────────────────────────────────────────────────────

  private async fetchGoogle(
    origin: LatLng, destination: LatLng, apiKey: string
  ): Promise<WalkingRouteResult> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${apiKey}`;
    const data = await fetchWithTimeout(url).then(r => r.json());

    if (data.status !== 'OK' || !data.routes?.length) {
      throw new Error(`Google Directions: ${data.status}`);
    }

    const leg = data.routes[0].legs[0];
    return {
      provider: 'GOOGLE_DIRECTIONS',
      distanceMeters: leg.distance.value,
      durationSeconds: leg.duration.value,
      polyline: data.routes[0].overview_polyline.points,
      waypoints: this.decodePolyline(data.routes[0].overview_polyline.points),
    };
  }

  private async fetchMapbox(
    origin: LatLng, destination: LatLng, token: string
  ): Promise<WalkingRouteResult> {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=polyline&overview=full&access_token=${token}`;
    const data = await fetchWithTimeout(url).then(r => r.json());

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error(`Mapbox Directions: ${data.code}`);
    }

    const route = data.routes[0];
    return {
      provider: 'MAPBOX_WALKING',
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      polyline: route.geometry,
      waypoints: this.decodePolyline(route.geometry),
    };
  }

  private async fetchOsrm(
    origin: LatLng, destination: LatLng, baseUrl: string
  ): Promise<WalkingRouteResult> {
    const url = `${baseUrl}/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
    const data = await fetchWithTimeout(url).then(r => r.json());

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error(`OSRM: ${data.code}`);
    }

    const route = data.routes[0];
    return {
      provider: 'OSRM_FOOT',
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      polyline: route.geometry,
      waypoints: this.decodePolyline(route.geometry),
    };
  }

  // ── Fallback ───────────────────────────────────────────────────────────────

  private haversineFallback(origin: LatLng, destination: LatLng): WalkingRouteResult {
    const toRad = (deg: number) => (deg * Math.PI) / 180;

    const phi1 = toRad(origin.lat);
    const phi2 = toRad(destination.lat);
    const deltaPhi = toRad(destination.lat - origin.lat);
    const deltaLambda = toRad(destination.lng - origin.lng);

    const a = Math.sin(deltaPhi / 2) ** 2 +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;

    const airMeters = EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const streetMeters = Math.round(airMeters * PEDESTRIAN_CURVATURE_FACTOR);
    const speedMPS = DEFAULT_WALKING_SPEED_KMH / 3.6;
    const durationSeconds = Math.round(streetMeters / speedMPS);

    return {
      provider: 'HAVERSINE_FALLBACK',
      distanceMeters: streetMeters,
      durationSeconds,
      polyline: '',
      waypoints: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
    };
  }

  // ── Polyline decoder ───────────────────────────────────────────────────────

  private decodePolyline(encoded: string): [number, number][] {
    const coords: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let b: number;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += result & 1 ? ~(result >> 1) : result >> 1;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += result & 1 ? ~(result >> 1) : result >> 1;

      coords.push([lat / 1e5, lng / 1e5]);
    }

    return coords;
  }
}