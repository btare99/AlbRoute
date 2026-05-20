import { LatLng } from './walkingEngine';

export class ReroutingService {
  private static lastCalculatedTime = 0;
  private static recalculationDebounceMs = 2500;

  /**
   * Checks if the passenger has deviated from the walking route (further than 15 meters)
   */
  static shouldRecalculateRoute(
    currentGps: LatLng,
    activeRouteWaypoints: [number, number][],
    deviationLimitMeters = 15
  ): boolean {
    if (activeRouteWaypoints.length < 2) return true;

    const now = Date.now();
    if (now - this.lastCalculatedTime < this.recalculationDebounceMs) {
      return false;
    }

    let minDistance = Infinity;

    for (let i = 0; i < activeRouteWaypoints.length - 1; i++) {
      const p1 = { lat: activeRouteWaypoints[i][0], lng: activeRouteWaypoints[i][1] };
      const p2 = { lat: activeRouteWaypoints[i+1][0], lng: activeRouteWaypoints[i+1][1] };
      
      const segmentDistance = this.getPerpendicularDistance(currentGps, p1, p2);
      if (segmentDistance < minDistance) {
        minDistance = segmentDistance;
      }
    }

    const isDeviated = minDistance > deviationLimitMeters;
    if (isDeviated) {
      this.lastCalculatedTime = now;
    }
    
    return isDeviated;
  }

  private static getPerpendicularDistance(pt: LatLng, p1: LatLng, p2: LatLng): number {
    const x = pt.lng, y = pt.lat;
    const x1 = p1.lng, y1 = p1.lat;
    const x2 = p2.lng, y2 = p2.lat;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy) * 111300; // Conversion to meters approximation
  }
}
