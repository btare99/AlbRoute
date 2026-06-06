// ─── Route Service ───────────────────────────────────────────────────────────
// Fetches route alternatives from the Mapbox Directions API.
// Returns structured Route objects with geometry, steps, and metadata.

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  maneuver: {
    type: string;       // 'turn', 'depart', 'arrive', 'merge', etc.
    modifier?: string;  // 'left', 'right', 'straight', 'slight left', etc.
    location: [number, number]; // [lng, lat]
    bearing_after: number;
    bearing_before: number;
  };
}

export interface Route {
  id: string;
  label: string;
  geometry: GeoJSON.LineString;
  coordinates: [number, number][]; // [lat, lng][] for Leaflet
  steps: RouteStep[];
  totalDistance: number; // meters
  totalDuration: number; // seconds
}

/**
 * Fetches up to 3 route alternatives from Mapbox Directions API.
 * @param origin [lng, lat]
 * @param destination [lng, lat]
 * @returns Array of Route objects
 */
export async function fetchRoutes(
  origin: [number, number],
  destination: [number, number]
): Promise<Route[]> {
  if (!MAPBOX_TOKEN) {
    console.warn('[RouteService] No MAPBOX_TOKEN configured. Set NEXT_PUBLIC_MAPBOX_TOKEN.');
    return [];
  }

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?alternatives=true&geometries=geojson&overview=full&steps=true&language=en&access_token=${MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[RouteService] API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (!data.routes || data.routes.length === 0) {
      console.warn('[RouteService] No routes found');
      return [];
    }

    const labels = ['Fastest', 'Alternative 1', 'Alternative 2'];

    return data.routes.map((route: any, index: number): Route => {
      const steps: RouteStep[] = [];

      // Extract steps from all legs
      if (route.legs) {
        route.legs.forEach((leg: any) => {
          if (leg.steps) {
            leg.steps.forEach((step: any) => {
              steps.push({
                instruction: step.maneuver?.instruction || '',
                distance: step.distance || 0,
                duration: step.duration || 0,
                maneuver: {
                  type: step.maneuver?.type || 'turn',
                  modifier: step.maneuver?.modifier,
                  location: step.maneuver?.location || [0, 0],
                  bearing_after: step.maneuver?.bearing_after || 0,
                  bearing_before: step.maneuver?.bearing_before || 0,
                },
              });
            });
          }
        });
      }

      // Convert GeoJSON coordinates [lng, lat] to Leaflet-friendly [lat, lng]
      const coordinates: [number, number][] = route.geometry?.coordinates?.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      ) || [];

      return {
        id: `route_${index}`,
        label: labels[index] || `Route ${index + 1}`,
        geometry: route.geometry,
        coordinates,
        steps,
        totalDistance: route.distance || 0,
        totalDuration: route.duration || 0,
      };
    });
  } catch (error) {
    console.error('[RouteService] Fetch error:', error);
    return [];
  }
}

/**
 * Fetches a single re-route from current position to destination.
 * Used when user deviates from the active route.
 */
export async function fetchReroute(
  currentPosition: [number, number], // [lng, lat]
  destination: [number, number]      // [lng, lat]
): Promise<Route | null> {
  const routes = await fetchRoutes(currentPosition, destination);
  return routes.length > 0 ? routes[0] : null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format distance: meters < 1000, km above */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Format duration to human-readable */
export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

/** Format ETA as "Arriving at HH:MM" */
export function formatETA(durationSeconds: number): string {
  const arrival = new Date(Date.now() + durationSeconds * 1000);
  return arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Get maneuver icon name based on step type/modifier */
export function getManeuverIcon(type: string, modifier?: string): string {
  if (type === 'arrive') return '🏁';
  if (type === 'depart') return '🚀';

  switch (modifier) {
    case 'left': return '⬅️';
    case 'sharp left': return '↰';
    case 'slight left': return '↖️';
    case 'right': return '➡️';
    case 'sharp right': return '↱';
    case 'slight right': return '↗️';
    case 'straight': return '⬆️';
    case 'uturn': return '↩️';
    default: return '⬆️';
  }
}
