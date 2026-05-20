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

export class WalkingEngine {
  private googleApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  private mapboxAccessToken = process.env.MAPBOX_ACCESS_TOKEN || '';
  private osrmBaseUrl = 'https://router.project-osrm.org';
  private defaultWalkingSpeedKmh = 5.0; // 1.39 m/s

  /**
   * Main entry point to calculate the absolute shortest walking path.
   */
  async calculateWalkingRoute(
    origin: LatLng,
    destination: LatLng,
    providerPriority: ('GOOGLE' | 'MAPBOX' | 'OSRM')[] = ['GOOGLE', 'MAPBOX', 'OSRM']
  ): Promise<WalkingRouteResult> {
    for (const provider of providerPriority) {
      try {
        switch (provider) {
          case 'GOOGLE':
            if (this.googleApiKey) return await this.fetchGoogleWalking(origin, destination);
            break;
          case 'MAPBOX':
            if (this.mapboxAccessToken) return await this.fetchMapboxWalking(origin, destination);
            break;
          case 'OSRM':
            return await this.fetchOsrmWalking(origin, destination);
        }
      } catch (err: any) {
        console.warn(`Pedestrian Engine: ${provider} routing failed. Swapping to fallback... Error:`, err.message);
      }
    }

    return this.calculateHaversineFallback(origin, destination);
  }

  private async fetchGoogleWalking(origin: LatLng, destination: LatLng): Promise<WalkingRouteResult> {
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=walking&key=${this.googleApiKey}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API fetch failed with status: ${response.status}`);
    }
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes.length) {
      throw new Error(`Google API returned status: ${data.status}`);
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    return {
      provider: 'GOOGLE_DIRECTIONS',
      distanceMeters: leg.distance.value,
      durationSeconds: leg.duration.value,
      polyline: route.overview_polyline.points,
      waypoints: this.decodePolyline(route.overview_polyline.points)
    };
  }

  private async fetchMapboxWalking(origin: LatLng, destination: LatLng): Promise<WalkingRouteResult> {
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?geometries=polyline&overview=full&access_token=${this.mapboxAccessToken}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Mapbox API fetch failed with status: ${response.status}`);
    }
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes.length) {
      throw new Error(`Mapbox API returned code: ${data.code}`);
    }

    const route = data.routes[0];
    return {
      provider: 'MAPBOX_WALKING',
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      polyline: route.geometry,
      waypoints: this.decodePolyline(route.geometry)
    };
  }

  private async fetchOsrmWalking(origin: LatLng, destination: LatLng): Promise<WalkingRouteResult> {
    const url = `${this.osrmBaseUrl}/route/v1/foot/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM API fetch failed with status: ${response.status}`);
    }
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes.length) {
      throw new Error(`OSRM Engine returned code: ${data.code}`);
    }

    const route = data.routes[0];
    return {
      provider: 'OSRM_FOOT',
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      polyline: route.geometry,
      waypoints: this.decodePolyline(route.geometry)
    };
  }

  private calculateHaversineFallback(origin: LatLng, destination: LatLng): WalkingRouteResult {
    const R = 6371e3; // meters
    const phi1 = (origin.lat * Math.PI) / 180;
    const phi2 = (destination.lat * Math.PI) / 180;
    const deltaPhi = ((destination.lat - origin.lat) * Math.PI) / 180;
    const deltaLambda = ((destination.lng - origin.lng) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const airDistance = R * c;

    // Apply pedestrian curvature buffer factor (1.41)
    const streetDistanceMeters = Math.round(airDistance * 1.414);
    const walkingSpeedMetersPerSecond = this.defaultWalkingSpeedKmh / 3.6;
    const durationSeconds = Math.round(streetDistanceMeters / walkingSpeedMetersPerSecond);

    return {
      provider: 'HAVERSINE_FALLBACK_STREET_ESTIMATE',
      distanceMeters: streetDistanceMeters,
      durationSeconds,
      polyline: '',
      waypoints: [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ]
    };
  }

  private decodePolyline(str: string): [number, number][] {
    let index = 0;
    const len = str.length;
    let lat = 0;
    let lng = 0;
    const coordinates: [number, number][] = [];

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push([lat / 1e5, lng / 1e5]);
    }
    return coordinates;
  }
}
