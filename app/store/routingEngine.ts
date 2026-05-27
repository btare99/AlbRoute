// ─── FORWARD-PROGRESSION ROUTING ENGINE ─────────────────────────────────────
// Ensures passengers NEVER travel backward along a route.
// Primary validation: stop sequence index order
// Secondary validation: polyline progression percentage
// ─────────────────────────────────────────────────────────────────────────────

import { BUS_ROUTES, BUS_STOPS } from '../constants/busData';
import { BUS_SHAPES } from './busShapes';

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface RouteStopEntry {
  stopId: string;
  stopName: string;
  stopIndex: number;         // 0-based position in the ordered sequence
  lat: number;
  lng: number;
  distanceFromStart: number; // cumulative distance in coordinate units along polyline
  progressionPercentage: number; // 0-100%
}

export interface RouteDirection {
  routeId: string;
  routeName: string;
  direction: 'forward' | 'return';
  stops: RouteStopEntry[];
  polyline: [number, number][];
  totalPolylineLength: number;
}

export interface RouteValidationResult {
  valid: boolean;
  boardingIndex: number;
  destinationIndex: number;
  boardingProgress: number;
  destinationProgress: number;
  reason: string;
}

export interface RouteDebugInfo {
  routeName: string;
  directionId: 'forward' | 'return';
  boardingStop: string;
  boardingIndex: number;
  destinationStop: string;
  destinationIndex: number;
  boardingProgress: number;
  destinationProgress: number;
  validationResult: 'VALID' | 'INVALID_BACKWARD_INDEX' | 'INVALID_BACKWARD_PROGRESS';
}

export interface DirectRouteCandidate {
  route: any;
  direction: 'forward' | 'return';
  boardingStopId: string;
  boardingStopName: string;
  alightStopId: string;
  alightStopName: string;
  stopIds: string[];
  stopNames: string[];
  numStops: number;
  boardingIndex: number;
  destinationIndex: number;
  boardingProgress: number;
  destinationProgress: number;
  debugInfo: RouteDebugInfo;
}

export interface TransferRouteCandidate {
  legs: DirectRouteCandidate[];
  transferWalkDist: number;
  transferWalkTime: number;
  transferStopFrom: string;
  transferStopTo: string;
}

// ─── POLYLINE UTILITIES ─────────────────────────────────────────────────────

/** Calculate accumulated distance (progress) of a point projected onto a polyline */
const getProgressOnPolyline = (point: [number, number], polyline: [number, number][]): number => {
  if (polyline.length < 2) return 0;

  let minD2 = Infinity;
  let bestProgress = 0;
  let accumulatedDist = 0;
  const [px, py] = point;

  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];

    const dx = bx - ax;
    const dy = by - ay;
    const segmentLength = Math.sqrt(dx * dx + dy * dy);

    let t = 0;
    if (segmentLength > 0) {
      t = ((px - ax) * dx + (py - ay) * dy) / (segmentLength * segmentLength);
      t = Math.max(0, Math.min(1, t));
    }

    const cx = ax + t * dx;
    const cy = ay + t * dy;

    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) {
      minD2 = dist2;
      bestProgress = accumulatedDist + t * segmentLength;
    }
    accumulatedDist += segmentLength;
  }

  return bestProgress;
};

/** Calculate total length of a polyline */
const getPolylineLength = (polyline: [number, number][]): number => {
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dx = polyline[i + 1][0] - polyline[i][0];
    const dy = polyline[i + 1][1] - polyline[i][1];
    total += Math.sqrt(dx * dx + dy * dy);
  }
  return total;
};

/** Get shape coordinates for a route direction */
const getShapeCoords = (routeId: string, direction: 'forward' | 'return'): [number, number][] => {
  const shapeKey = direction === 'forward' ? `${routeId}_0` : `${routeId}_1`;
  let shapeCoords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
  if (shapeCoords.length === 0 && direction === 'forward') {
    shapeCoords = (BUS_SHAPES[routeId as keyof typeof BUS_SHAPES] as [number, number][]) || [];
  }
  return shapeCoords;
};

/** Get shape for a given direction, trying smart matching by start stop proximity */
const getSmartShapeCoords = (routeId: string, direction: 'forward' | 'return', stopIds: string[]): [number, number][] => {
  const shape0: [number, number][] = BUS_SHAPES[`${routeId}_0` as keyof typeof BUS_SHAPES] || [];
  const shape1: [number, number][] = BUS_SHAPES[`${routeId}_1` as keyof typeof BUS_SHAPES] || [];
  const mainShape: [number, number][] = (BUS_SHAPES[routeId as keyof typeof BUS_SHAPES] as [number, number][]) || [];

  const startStop = BUS_STOPS.find(s => s.id === stopIds[0]);
  const endStop = BUS_STOPS.find(s => s.id === stopIds[stopIds.length - 1]);

  if (startStop && endStop) {
    const dist0 = shape0.length > 0
      ? Math.sqrt(Math.pow(shape0[0][0] - startStop.lat, 2) + Math.pow(shape0[0][1] - startStop.lng, 2))
      : Infinity;
    const dist1 = shape1.length > 0
      ? Math.sqrt(Math.pow(shape1[0][0] - startStop.lat, 2) + Math.pow(shape1[0][1] - startStop.lng, 2))
      : Infinity;

    if (dist0 < dist1 && dist0 < 0.01) return shape0;
    if (dist1 < dist0 && dist1 < 0.01) return shape1;
    if (mainShape.length > 0) return direction === 'return' ? [...mainShape].reverse() : mainShape;
  }

  // Fallback to direction-based key
  let coords = getShapeCoords(routeId, direction);

  // If return shape missing, try reversing forward
  if (coords.length === 0 && direction === 'return') {
    const forward = getShapeCoords(routeId, 'forward');
    if (forward.length > 0) coords = [...forward].reverse();
  }

  return coords;
};

// ─── ROUTE STOP INDEX ───────────────────────────────────────────────────────

/** Pre-built index of all route directions with ordered stop sequences */
let routeDirectionIndex: Map<string, RouteDirection> = new Map();

/** Build the complete route stop index for all routes and directions */
export const buildRouteStopIndex = (): Map<string, RouteDirection> => {
  const index = new Map<string, RouteDirection>();

  for (const route of BUS_ROUTES) {
    const directions: { stopIds: string[]; dirName: 'forward' | 'return' }[] = [
      { stopIds: route.stops, dirName: 'forward' },
    ];

    if ((route as any).returnStops && (route as any).returnStops.length > 0) {
      directions.push({ stopIds: (route as any).returnStops, dirName: 'return' });
    }

    for (const { stopIds, dirName } of directions) {
      const polyline = getSmartShapeCoords(route.id, dirName, stopIds);
      const totalPolylineLength = polyline.length >= 2 ? getPolylineLength(polyline) : 0;

      const stops: RouteStopEntry[] = stopIds.map((stopId, idx) => {
        const stopData = BUS_STOPS.find(s => s.id === stopId);
        if (!stopData) {
          return {
            stopId,
            stopName: stopId,
            stopIndex: idx,
            lat: 0,
            lng: 0,
            distanceFromStart: 0,
            progressionPercentage: 0,
          };
        }

        let distanceFromStart = 0;
        let progressionPercentage = 0;

        if (polyline.length >= 2 && totalPolylineLength > 0) {
          distanceFromStart = getProgressOnPolyline([stopData.lat, stopData.lng], polyline);
          progressionPercentage = (distanceFromStart / totalPolylineLength) * 100;
        } else if (stopIds.length > 1) {
          // Fallback: use index-based percentage when no polyline
          progressionPercentage = (idx / (stopIds.length - 1)) * 100;
        }

        return {
          stopId,
          stopName: stopData.name,
          stopIndex: idx,
          lat: stopData.lat,
          lng: stopData.lng,
          distanceFromStart,
          progressionPercentage,
        };
      });

      const key = `${route.id}_${dirName}`;
      index.set(key, {
        routeId: route.id,
        routeName: route.name,
        direction: dirName,
        stops,
        polyline,
        totalPolylineLength,
      });
    }
  }

  routeDirectionIndex = index;
  return index;
};

/** Get the route direction index, building it if needed */
export const getRouteDirectionIndex = (): Map<string, RouteDirection> => {
  if (routeDirectionIndex.size === 0) {
    buildRouteStopIndex();
  }
  return routeDirectionIndex;
};

// ─── FORWARD PROGRESSION VALIDATION ─────────────────────────────────────────

/** 
 * Validate that a journey moves forward along the route.
 * Primary check: stop sequence index (boardingIndex < destIndex)
 * Secondary check: polyline progression (boardingProgress < destProgress)
 */
export const validateForwardProgression = (
  routeId: string,
  direction: 'forward' | 'return',
  boardingStopId: string,
  destinationStopId: string
): RouteValidationResult => {
  const index = getRouteDirectionIndex();
  const key = `${routeId}_${direction}`;
  const routeDir = index.get(key);

  if (!routeDir) {
    return {
      valid: false,
      boardingIndex: -1,
      destinationIndex: -1,
      boardingProgress: 0,
      destinationProgress: 0,
      reason: `Route direction not found: ${key}`,
    };
  }

  // Find ALL occurrences of boarding and destination stops (handles circular routes)
  const boardingEntries = routeDir.stops.filter(s => s.stopId === boardingStopId);
  const destEntries = routeDir.stops.filter(s => s.stopId === destinationStopId);

  if (boardingEntries.length === 0) {
    return {
      valid: false,
      boardingIndex: -1,
      destinationIndex: -1,
      boardingProgress: 0,
      destinationProgress: 0,
      reason: `Boarding stop ${boardingStopId} not found on route ${routeId} (${direction})`,
    };
  }

  if (destEntries.length === 0) {
    return {
      valid: false,
      boardingIndex: -1,
      destinationIndex: -1,
      boardingProgress: 0,
      destinationProgress: 0,
      reason: `Destination stop ${destinationStopId} not found on route ${routeId} (${direction})`,
    };
  }

  // Find the best valid pair where destIndex > boardingIndex
  for (const boarding of boardingEntries) {
    for (const dest of destEntries) {
      // PRIMARY CHECK: Stop sequence index
      if (dest.stopIndex <= boarding.stopIndex) {
        continue; // Try next pair
      }

      // SECONDARY CHECK: Polyline progression
      if (routeDir.totalPolylineLength > 0 && dest.progressionPercentage <= boarding.progressionPercentage) {
        // Index says forward but polyline says backward — log warning but trust index
        // This can happen on very curved routes where polyline projection is ambiguous
        console.warn(
          `[ROUTING] ⚠️ Index-polyline mismatch: ${routeId} (${direction}) ` +
          `${boardingStopId}[idx=${boarding.stopIndex}, prog=${boarding.progressionPercentage.toFixed(1)}%] → ` +
          `${destinationStopId}[idx=${dest.stopIndex}, prog=${dest.progressionPercentage.toFixed(1)}%]`
        );
        // Still allow it — index is primary authority
      }

      return {
        valid: true,
        boardingIndex: boarding.stopIndex,
        destinationIndex: dest.stopIndex,
        boardingProgress: boarding.progressionPercentage,
        destinationProgress: dest.progressionPercentage,
        reason: 'VALID',
      };
    }
  }

  // No valid forward pair found
  const bestBoarding = boardingEntries[0];
  const bestDest = destEntries[0];
  
  console.log(
    `[ROUTING] 🚫 INVALID ROUTE - BACKWARD TRAVEL DETECTED: ${routeId} (${direction}) ` +
    `${boardingStopId}[idx=${bestBoarding.stopIndex}] → ${destinationStopId}[idx=${bestDest.stopIndex}]`
  );

  return {
    valid: false,
    boardingIndex: bestBoarding.stopIndex,
    destinationIndex: bestDest.stopIndex,
    boardingProgress: bestBoarding.progressionPercentage,
    destinationProgress: bestDest.progressionPercentage,
    reason: 'INVALID_BACKWARD_INDEX',
  };
};

// ─── DEBUG OUTPUT ────────────────────────────────────────────────────────────

/** Generate structured debug info for a route evaluation */
export const getRouteDebugInfo = (
  routeId: string,
  routeName: string,
  direction: 'forward' | 'return',
  boardingStopId: string,
  boardingStopName: string,
  destinationStopId: string,
  destinationStopName: string,
  validation: RouteValidationResult
): RouteDebugInfo => {
  let validationResult: RouteDebugInfo['validationResult'] = 'VALID';
  if (!validation.valid) {
    validationResult = validation.reason.includes('PROGRESS')
      ? 'INVALID_BACKWARD_PROGRESS'
      : 'INVALID_BACKWARD_INDEX';
  }

  return {
    routeName,
    directionId: direction,
    boardingStop: boardingStopName,
    boardingIndex: validation.boardingIndex,
    destinationStop: destinationStopName,
    destinationIndex: validation.destinationIndex,
    boardingProgress: Math.round(validation.boardingProgress * 10) / 10,
    destinationProgress: Math.round(validation.destinationProgress * 10) / 10,
    validationResult,
  };
};

/** Log debug info for a route evaluation */
export const logRouteDebug = (debug: RouteDebugInfo): void => {
  const icon = debug.validationResult === 'VALID' ? '✅' : '🚫';
  console.log(
    `[ROUTING] ${icon} Route: ${debug.routeName} | Direction: ${debug.directionId} | ` +
    `Board: ${debug.boardingStop} [idx=${debug.boardingIndex}, ${debug.boardingProgress}%] → ` +
    `Alight: ${debug.destinationStop} [idx=${debug.destinationIndex}, ${debug.destinationProgress}%] | ` +
    `Result: ${debug.validationResult}`
  );
};

// ─── DIRECT ROUTE FINDER ────────────────────────────────────────────────────

/**
 * Find all valid direct routes between a boarding stop and alighting stop.
 * Only returns routes where the journey moves FORWARD along the route.
 */
export const findDirectRoutes = (
  boardingStopId: string,
  alightStopId: string
): DirectRouteCandidate[] => {
  const candidates: DirectRouteCandidate[] = [];
  const index = getRouteDirectionIndex();

  for (const route of BUS_ROUTES) {
    const directions: ('forward' | 'return')[] = ['forward'];
    if ((route as any).returnStops && (route as any).returnStops.length > 0) {
      directions.push('return');
    }

    for (const dirName of directions) {
      const key = `${route.id}_${dirName}`;
      const routeDir = index.get(key);
      if (!routeDir) continue;

      // Find all occurrences of boarding and destination stops
      const boardingEntries = routeDir.stops.filter(s => s.stopId === boardingStopId);
      const destEntries = routeDir.stops.filter(s => s.stopId === alightStopId);

      if (boardingEntries.length === 0 || destEntries.length === 0) continue;

      // Try all valid pairs
      for (const boarding of boardingEntries) {
        for (const dest of destEntries) {
          if (dest.stopIndex <= boarding.stopIndex) {
            // Log rejected backward route
            const debugInfo = getRouteDebugInfo(
              route.id, route.name, dirName,
              boardingStopId, boarding.stopName,
              alightStopId, dest.stopName,
              { valid: false, boardingIndex: boarding.stopIndex, destinationIndex: dest.stopIndex,
                boardingProgress: boarding.progressionPercentage, destinationProgress: dest.progressionPercentage,
                reason: 'INVALID_BACKWARD_INDEX' }
            );
            logRouteDebug(debugInfo);
            continue;
          }

          // Valid forward progression — build candidate
          const stopArr = dirName === 'forward' ? route.stops : ((route as any).returnStops || []);
          const stopIds = stopArr.slice(boarding.stopIndex, dest.stopIndex + 1);
          const stopNames = stopIds
            .map((id: string) => BUS_STOPS.find(s => s.id === id)?.name)
            .filter(Boolean) as string[];

          const validation = validateForwardProgression(route.id, dirName, boardingStopId, alightStopId);

          const debugInfo = getRouteDebugInfo(
            route.id, route.name, dirName,
            boardingStopId, boarding.stopName,
            alightStopId, dest.stopName,
            validation
          );
          logRouteDebug(debugInfo);

          if (!validation.valid) continue;

          candidates.push({
            route,
            direction: dirName,
            boardingStopId,
            boardingStopName: boarding.stopName,
            alightStopId,
            alightStopName: dest.stopName,
            stopIds,
            stopNames,
            numStops: dest.stopIndex - boarding.stopIndex,
            boardingIndex: validation.boardingIndex,
            destinationIndex: validation.destinationIndex,
            boardingProgress: validation.boardingProgress,
            destinationProgress: validation.destinationProgress,
            debugInfo,
          });
        }
      }
    }
  }

  return candidates;
};

// ─── TRANSFER ROUTE FINDER ──────────────────────────────────────────────────

/**
 * Find valid transfer routes between a boarding stop and alighting stop.
 * Each leg MUST move forward independently. Transfer must not cause backward movement.
 */
export const findTransferRoutes = (
  boardingStopId: string,
  alightStopId: string,
  maxTransferWalkDist: number = 300
): TransferRouteCandidate[] => {
  const candidates: TransferRouteCandidate[] = [];
  const index = getRouteDirectionIndex();

  for (const route1 of BUS_ROUTES) {
    const r1Directions: ('forward' | 'return')[] = ['forward'];
    if ((route1 as any).returnStops?.length > 0) r1Directions.push('return');

    for (const r1Dir of r1Directions) {
      const r1Key = `${route1.id}_${r1Dir}`;
      const r1RouteDir = index.get(r1Key);
      if (!r1RouteDir) continue;

      // Find boarding stop on route 1
      const r1BoardingEntries = r1RouteDir.stops.filter(s => s.stopId === boardingStopId);
      if (r1BoardingEntries.length === 0) continue;

      for (const route2 of BUS_ROUTES) {
        if (route1.id === route2.id) continue;

        const r2Directions: ('forward' | 'return')[] = ['forward'];
        if ((route2 as any).returnStops?.length > 0) r2Directions.push('return');

        for (const r2Dir of r2Directions) {
          const r2Key = `${route2.id}_${r2Dir}`;
          const r2RouteDir = index.get(r2Key);
          if (!r2RouteDir) continue;

          // Find alighting stop on route 2
          const r2AlightEntries = r2RouteDir.stops.filter(s => s.stopId === alightStopId);
          if (r2AlightEntries.length === 0) continue;

          // Try each boarding entry on route 1
          for (const r1Boarding of r1BoardingEntries) {
            // Look for transfer stops: on route 1 AFTER boarding, on route 2 BEFORE alighting
            for (let i = r1Boarding.stopIndex + 1; i < r1RouteDir.stops.length; i++) {
              const transferFrom = r1RouteDir.stops[i];

              for (const r2Alight of r2AlightEntries) {
                for (let j = 0; j < r2Alight.stopIndex; j++) {
                  const transferTo = r2RouteDir.stops[j];

                  // Calculate walk distance between transfer stops
                  let walkDist: number;
                  if (transferFrom.stopId === transferTo.stopId) {
                    walkDist = 0;
                  } else {
                    walkDist = Math.sqrt(
                      Math.pow(transferFrom.lat - transferTo.lat, 2) +
                      Math.pow(transferFrom.lng - transferTo.lng, 2)
                    ) * 111320;
                  }

                  if (walkDist > maxTransferWalkDist) continue;

                  // Validate leg 1: boarding → transfer (MUST be forward)
                  const leg1Validation = validateForwardProgression(
                    route1.id, r1Dir, boardingStopId, transferFrom.stopId
                  );
                  if (!leg1Validation.valid) continue;

                  // Validate leg 2: transfer → alighting (MUST be forward)
                  const leg2Validation = validateForwardProgression(
                    route2.id, r2Dir, transferTo.stopId, alightStopId
                  );
                  if (!leg2Validation.valid) continue;

                  // Both legs valid — build candidate
                  const r1StopArr = r1Dir === 'forward' ? route1.stops : ((route1 as any).returnStops || []);
                  const r2StopArr = r2Dir === 'forward' ? route2.stops : ((route2 as any).returnStops || []);

                  const leg1StopIds = r1StopArr.slice(r1Boarding.stopIndex, i + 1);
                  const leg2StopIds = r2StopArr.slice(j, r2Alight.stopIndex + 1);

                  const leg1Names = leg1StopIds.map((id: string) => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean) as string[];
                  const leg2Names = leg2StopIds.map((id: string) => BUS_STOPS.find(s => s.id === id)?.name).filter(Boolean) as string[];

                  const leg1Debug = getRouteDebugInfo(
                    route1.id, route1.name, r1Dir,
                    boardingStopId, r1Boarding.stopName,
                    transferFrom.stopId, transferFrom.stopName,
                    leg1Validation
                  );

                  const leg2Debug = getRouteDebugInfo(
                    route2.id, route2.name, r2Dir,
                    transferTo.stopId, transferTo.stopName,
                    alightStopId, r2AlightEntries[0].stopName,
                    leg2Validation
                  );

                  const leg1: DirectRouteCandidate = {
                    route: route1,
                    direction: r1Dir,
                    boardingStopId,
                    boardingStopName: r1Boarding.stopName,
                    alightStopId: transferFrom.stopId,
                    alightStopName: transferFrom.stopName,
                    stopIds: leg1StopIds,
                    stopNames: leg1Names,
                    numStops: i - r1Boarding.stopIndex,
                    boardingIndex: leg1Validation.boardingIndex,
                    destinationIndex: leg1Validation.destinationIndex,
                    boardingProgress: leg1Validation.boardingProgress,
                    destinationProgress: leg1Validation.destinationProgress,
                    debugInfo: leg1Debug,
                  };

                  const leg2: DirectRouteCandidate = {
                    route: route2,
                    direction: r2Dir,
                    boardingStopId: transferTo.stopId,
                    boardingStopName: transferTo.stopName,
                    alightStopId,
                    alightStopName: r2AlightEntries[0].stopName,
                    stopIds: leg2StopIds,
                    stopNames: leg2Names,
                    numStops: r2Alight.stopIndex - j,
                    boardingIndex: leg2Validation.boardingIndex,
                    destinationIndex: leg2Validation.destinationIndex,
                    boardingProgress: leg2Validation.boardingProgress,
                    destinationProgress: leg2Validation.destinationProgress,
                    debugInfo: leg2Debug,
                  };

                  candidates.push({
                    legs: [leg1, leg2],
                    transferWalkDist: Math.round(walkDist),
                    transferWalkTime: Math.ceil(walkDist / 80),
                    transferStopFrom: transferFrom.stopName,
                    transferStopTo: transferTo.stopName,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return candidates;
};

// ─── VEHICLE DIRECTION VALIDATION ───────────────────────────────────────────

/**
 * Validate that a live bus is moving in the correct direction for a route.
 * Compares vehicle bearing (from GPS points) with route segment bearing.
 */
export const validateVehicleDirection = (
  bus: { lat: number; lng: number; routeId: string; direction: string; currentPointIdx?: number },
  routeId: string,
  expectedDirection: 'forward' | 'return'
): boolean => {
  // Bus must be assigned to the same route
  if (bus.routeId !== routeId) return false;

  // Bus must be going in the expected direction
  if (bus.direction !== expectedDirection) return false;

  // If we have shape data, verify against polyline bearing
  const polyline = getSmartShapeCoords(
    routeId,
    expectedDirection,
    expectedDirection === 'forward'
      ? (BUS_ROUTES.find(r => r.id === routeId)?.stops || [])
      : ((BUS_ROUTES.find(r => r.id === routeId) as any)?.returnStops || [])
  );

  if (polyline.length < 2) return true; // Can't validate without shape, trust direction flag

  // Project bus onto polyline and check it's not at the very end (completed the route)
  const busProgress = getProgressOnPolyline([bus.lat, bus.lng], polyline);
  const totalLength = getPolylineLength(polyline);

  // If bus is > 98% through the route, it's about to reverse — don't count it
  if (totalLength > 0 && (busProgress / totalLength) > 0.98) return false;

  return true;
};

/**
 * Find the best approaching vehicle for a specific route, direction, and boarding stop.
 * Only considers vehicles moving in the correct direction and approaching the stop.
 */
export const findApproachingVehicle = (
  buses: any[],
  routeId: string,
  direction: 'forward' | 'return',
  boardingStopId: string
): { bus: any; etaMinutes: number } | null => {
  const boardingStop = BUS_STOPS.find(s => s.id === boardingStopId);
  if (!boardingStop) return null;

  const stopIds = direction === 'forward'
    ? (BUS_ROUTES.find(r => r.id === routeId)?.stops || [])
    : ((BUS_ROUTES.find(r => r.id === routeId) as any)?.returnStops || []);

  const polyline = getSmartShapeCoords(routeId, direction, stopIds);
  if (polyline.length < 2) return null;

  const boardProgress = getProgressOnPolyline([boardingStop.lat, boardingStop.lng], polyline);

  let bestEta = Infinity;
  let bestBus: any = null;

  for (const bus of buses) {
    if (!validateVehicleDirection(bus, routeId, direction)) continue;

    const busProgress = getProgressOnPolyline([bus.lat, bus.lng], polyline);
    const distToBoard = boardProgress - busProgress;

    // Bus must be approaching (positive distance) or very close (small negative = just passed tolerance)
    if (distToBoard >= -0.0003) {
      const speedKmh = bus.speed > 5 ? bus.speed : 30;
      const distMeters = distToBoard * 111320;
      const eta = Math.max(0, distMeters / (speedKmh * 1000 / 60));

      if (eta < bestEta) {
        bestEta = eta;
        bestBus = bus;
      }
    }
  }

  if (bestBus) {
    return { bus: bestBus, etaMinutes: Math.round(bestEta) };
  }

  return null;
};

// ─── ROUTE SCORING ──────────────────────────────────────────────────────────

/**
 * Score a route candidate with strict priority ordering:
 * 1. Direction validity (invalid = Infinity, NEVER selected)
 * 2. Fewest transfers (each transfer = +1000 base)
 * 3. Fastest travel time
 * 4. Shortest walking distance
 */
export const scoreRoute = (
  isDirectionValid: boolean,
  numTransfers: number,
  totalStops: number,
  walkDistMeters: number,
  walkTimeMinutes: number,
  liveBusAvailable: boolean,
  liveBusEta: number = 0,
  secondLegStops: number = 0
): number => {
  // Priority 1: Wrong direction = NEVER selected
  if (!isDirectionValid) return Infinity;

  // Priority 2: Transfer penalty (1000 per transfer makes it almost always prefer direct)
  const transferPenalty = numTransfers * 1000;

  // Priority 3: Travel time estimate
  const travelTimeEstimate = walkTimeMinutes + (totalStops * 2.5) + (numTransfers * 15);

  // Priority 4: Walking distance factor
  const walkFactor = walkDistMeters / 8;

  // Live bus bonus/penalty
  let liveBusAdjustment = 0;
  if (liveBusAvailable) {
    liveBusAdjustment = -10 + Math.min(10, liveBusEta * 0.5);
  } else {
    liveBusAdjustment = 15;
  }

  // Second leg bonus for transfer routes
  const secondLegBonus = numTransfers > 0 ? secondLegStops * 0.25 : 0;

  return transferPenalty + walkFactor + travelTimeEstimate - secondLegBonus + liveBusAdjustment;
};

// ─── LEG COORDS (for map rendering) ────────────────────────────────────────

/**
 * Get the polyline coordinates for a route leg (used for drawing on map).
 * Slices the full shape between boarding and alighting stops.
 */
export const getLegCoords = (leg: any): [number, number][] => {
  if (leg.isWalking) return [];

  const route = leg.route;
  if (!route) return [];

  let boardStopId = leg.stopIds ? leg.stopIds[0] : null;
  let alightStopId = leg.stopIds ? leg.stopIds[leg.stopIds.length - 1] : null;

  const boardStop = boardStopId
    ? BUS_STOPS.find((s: any) => s.id === boardStopId)
    : BUS_STOPS.find((s: any) => s.name === leg.boardAt);
  const alightStop = alightStopId
    ? BUS_STOPS.find((s: any) => s.id === alightStopId)
    : BUS_STOPS.find((s: any) => s.name === leg.alightAt);

  let legCoords: [number, number][] = [];
  let sliced = false;

  if (boardStop && alightStop) {
    const dirs = ['0', '1'];
    for (const dir of dirs) {
      const shapeKey = `${route.id}_${dir}`;
      let shapeCoords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
      if (shapeCoords.length === 0 && dir === '0') {
        shapeCoords = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];
      }

      if (shapeCoords.length > 0) {
        let boardIdx = 0, alightIdx = 0;
        let minDistBoard = Infinity, minDistAlight = Infinity;

        shapeCoords.forEach((pt, idx) => {
          const db = Math.pow(pt[0] - boardStop.lat, 2) + Math.pow(pt[1] - boardStop.lng, 2);
          if (db < minDistBoard) { minDistBoard = db; boardIdx = idx; }

          const da = Math.pow(pt[0] - alightStop.lat, 2) + Math.pow(pt[1] - alightStop.lng, 2);
          if (da < minDistAlight) { minDistAlight = da; alightIdx = idx; }
        });

        if (boardIdx <= alightIdx) {
          legCoords = shapeCoords.slice(boardIdx, alightIdx + 1);
          sliced = true;
          break;
        } else if (Math.abs(boardIdx - alightIdx) > 0) {
          legCoords = shapeCoords.slice(alightIdx, boardIdx + 1).reverse();
          sliced = true;
        }
      }
    }
  }

  // Fallback to direct lines between stops
  if (!sliced || legCoords.length < 2) {
    if (leg.stopIds) {
      legCoords = leg.stopIds
        .map((id: string) => {
          const st = BUS_STOPS.find((s: any) => s.id === id);
          return st ? [st.lat, st.lng] : null;
        })
        .filter(Boolean) as [number, number][];
    } else if (leg.stops) {
      legCoords = leg.stops
        .map((name: string) => {
          const st = BUS_STOPS.find((s: any) => s.name === name);
          return st ? [st.lat, st.lng] : null;
        })
        .filter(Boolean) as [number, number][];
    }
  }

  return legCoords;
};

/** Get the full shape coordinates for a route direction (used by map rendering) */
export const getFullShapeCoords = (routeId: string, direction: 'forward' | 'return'): [number, number][] => {
  return getShapeCoords(routeId, direction);
};

/** Re-export polyline progress for use by store (live bus tracking) */
export { getProgressOnPolyline };
