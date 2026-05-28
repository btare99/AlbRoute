import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUS_ROUTES, BUS_STOPS } from '../constants/busData';
import { BUS_SHAPES } from './busShapes';
export { BUS_ROUTES, BUS_STOPS };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WALK_SPEED_MPS = 1.4;          // 1.4 m/s ≈ 5 km/h walking speed
const BUS_SPEED_KMH = 30;            // average urban bus speed km/h
const MAX_WALK_METERS = 1200;        // max walk to/from stop
const MAX_TRANSFER_WALK_METERS = 400;// max walk between transfer stops
const MAX_TRANSFERS = 2;             // max bus changes allowed
const TRANSFER_PENALTY_SEC = 240;    // 4-minute penalty per transfer (boarding wait)
const EARTH_RADIUS_M = 6371000;

// ─── GEOMETRY HELPERS ─────────────────────────────────────────────────────────

/** Haversine distance in meters between two lat/lng points */
const haversineMeters = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = EARTH_RADIUS_M;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Walk time in seconds for a given meter distance */
const walkTimeSec = (meters: number): number => Math.round(meters / WALK_SPEED_MPS);

/** Snaps a [lat, lng] point to the closest point along a polyline's segments */
const findClosestPointOnPolyline = (point: [number, number], polyline: [number, number][]): [number, number] => {
  if (polyline.length === 0) return point;
  if (polyline.length === 1) return polyline[0];
  let minD2 = Infinity;
  let closestPoint: [number, number] = polyline[0];
  const [px, py] = point;
  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let t = 0;
    if (len2 > 0) t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    const cx = ax + t * dx, cy = ay + t * dy;
    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) { minD2 = dist2; closestPoint = [cx, cy]; }
  }
  return closestPoint;
};

/** Accumulated distance of a projected point along polyline (for direction validation) */
const getProgressOnPolyline = (point: [number, number], polyline: [number, number][]): number => {
  if (polyline.length < 2) return 0;
  let minD2 = Infinity, bestProgress = 0, accumulatedDist = 0;
  const [px, py] = point;
  for (let i = 0; i < polyline.length - 1; i++) {
    const [ax, ay] = polyline[i];
    const [bx, by] = polyline[i + 1];
    const dx = bx - ax, dy = by - ay;
    const segLen = Math.sqrt(dx * dx + dy * dy);
    let t = 0;
    if (segLen > 0) t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (segLen * segLen)));
    const cx = ax + t * dx, cy = ay + t * dy;
    const dist2 = (px - cx) * (px - cx) + (py - cy) * (py - cy);
    if (dist2 < minD2) { minD2 = dist2; bestProgress = accumulatedDist + t * segLen; }
    accumulatedDist += segLen;
  }
  return bestProgress;
};

/** Get detailed shape coords for a route leg (board → alight) */
const getLegCoords = (leg: any): [number, number][] => {
  if (leg.isWalking) return [];
  const route = leg.route;
  if (!route) return [];
  const boardStopId = leg.stopIds?.[0];
  const alightStopId = leg.stopIds?.[leg.stopIds.length - 1];
  const boardStop = boardStopId ? BUS_STOPS.find((s: any) => s.id === boardStopId) : BUS_STOPS.find((s: any) => s.name === leg.boardAt);
  const alightStop = alightStopId ? BUS_STOPS.find((s: any) => s.id === alightStopId) : BUS_STOPS.find((s: any) => s.name === leg.alightAt);
  let legCoords: [number, number][] = [];
  let sliced = false;
  if (boardStop && alightStop) {
    for (const dir of ['0', '1']) {
      const shapeKey = `${route.id}_${dir}`;
      let shapeCoords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
      if (shapeCoords.length === 0 && dir === '0') shapeCoords = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];
      if (shapeCoords.length > 0) {
        let boardIdx = 0, alightIdx = 0, minDistBoard = Infinity, minDistAlight = Infinity;
        shapeCoords.forEach((pt, idx) => {
          const db = (pt[0] - boardStop.lat) ** 2 + (pt[1] - boardStop.lng) ** 2;
          if (db < minDistBoard) { minDistBoard = db; boardIdx = idx; }
          const da = (pt[0] - alightStop.lat) ** 2 + (pt[1] - alightStop.lng) ** 2;
          if (da < minDistAlight) { minDistAlight = da; alightIdx = idx; }
        });
        if (boardIdx <= alightIdx) { legCoords = shapeCoords.slice(boardIdx, alightIdx + 1); sliced = true; break; }
        else if (Math.abs(boardIdx - alightIdx) > 0) { legCoords = shapeCoords.slice(alightIdx, boardIdx + 1).reverse(); sliced = true; }
      }
    }
  }
  if (!sliced || legCoords.length < 2) {
    if (leg.stopIds) {
      legCoords = leg.stopIds.map((id: string) => { const s = BUS_STOPS.find((s: any) => s.id === id); return s ? [s.lat, s.lng] : null; }).filter(Boolean) as [number, number][];
    } else {
      legCoords = leg.stops.map((name: string) => { const s = BUS_STOPS.find((s: any) => s.name === name); return s ? [s.lat, s.lng] : null; }).filter(Boolean) as [number, number][];
    }
  }
  return legCoords;
};

/** Get full shape for a route direction */
const getFullShapeCoords = (routeId: string, direction: 'forward' | 'return'): [number, number][] => {
  const shapeKey = direction === 'forward' ? `${routeId}_0` : `${routeId}_1`;
  let coords: [number, number][] = BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || [];
  if (coords.length === 0 && direction === 'forward') coords = (BUS_SHAPES[routeId as keyof typeof BUS_SHAPES] as [number, number][]) || [];
  return coords;
};

// ─── TRIP PLANNING ENGINE ─────────────────────────────────────────────────────
// Implements a RAPTOR-inspired (Round-based Public Transit Routing) algorithm
// with Dijkstra-style label correction, similar to how Google Maps plans transit.

interface StopLabel {
  arrivalTimeSec: number;   // earliest arrival in seconds from epoch
  transfers: number;        // number of bus changes so far
  prevLeg: TripLeg | null;  // leg that led to this label
  prevStopId: string | null;
  boardedRouteId: string | null;
}

interface TripLeg {
  isWalking?: boolean;
  route?: any;
  stops?: string[];
  stopIds?: string[];
  boardAt?: string;
  alightAt?: string;
  numStops?: number;
  direction?: 'forward' | 'return';
  walkingDist?: number;
  walkingTime?: number;  // in minutes for display
  walkingTimeSec?: number;
  liveBus?: any;
  etaMinutes?: number;
}

interface TripOption {
  legs: TripLeg[];
  totalTimeSec: number;
  walkDistMeters: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
  travelTime: number;       // minutes
  totalPrice: number;
  score: number;
  optionIndex?: number;
  from: string;
  to: string;
  isDirect: boolean;
  routeNames: string;
}

/**
 * Core RAPTOR-inspired router.
 * Finds up to `MAX_TRANSFERS+1` rounds of transit, building a label graph.
 * Returns top-4 Pareto-optimal options (min time, min transfers, min walk).
 */
const runRaptorRouter = (
  fromStops: { stop: any; walkDist: number }[],
  toStops: { stop: any; walkDist: number }[],
  departureTimeSec: number,
  isArriveBy: boolean,
  liveBuses: any[]
): TripOption[] => {
  // ── Build stop index for O(1) lookup ──
  const stopById = new Map<string, any>();
  BUS_STOPS.forEach((s: any) => stopById.set(s.id, s));

  // ── Build route index: routeId → { stops[], returnStops[], route } ──
  interface RouteDir { stopIds: string[]; direction: 'forward' | 'return'; route: any; }
  const allRouteDirs: RouteDir[] = [];
  BUS_ROUTES.forEach((route: any) => {
    if (route.stops?.length > 1) {
      const validStops = route.stops.every((id: string) => stopById.has(id));
      if (validStops) {
        allRouteDirs.push({ stopIds: route.stops, direction: 'forward', route });
      } else {
        console.warn(`Skipping invalid forward route direction for ${route.id} due to missing stop definitions`);
      }
    }
    if (route.returnStops?.length > 1) {
      const validStops = route.returnStops.every((id: string) => stopById.has(id));
      if (validStops) {
        allRouteDirs.push({ stopIds: route.returnStops, direction: 'return', route });
      } else {
        console.warn(`Skipping invalid return route direction for ${route.id} due to missing stop definitions`);
      }
    }
  });

  // stopId → list of (routeDirIndex, positionInRoute)
  const stopToRouteDirs = new Map<string, { rdIdx: number; pos: number }[]>();
  allRouteDirs.forEach((rd, rdIdx) => {
    rd.stopIds.forEach((stopId, pos) => {
      if (!stopToRouteDirs.has(stopId)) stopToRouteDirs.set(stopId, []);
      stopToRouteDirs.get(stopId)!.push({ rdIdx, pos });
    });
  });

  // ── Build live bus ETA map: routeId_direction → Map<stopId, etaSeconds> ──
  const liveBusEta = new Map<string, Map<string, number>>();
  liveBuses.forEach((bus: any) => {
    if (!bus.routeId || !bus.direction) return;
    const rd = allRouteDirs.find(r => r.route.id === bus.routeId && r.direction === bus.direction);
    if (!rd) return;
    const shape = getFullShapeCoords(bus.routeId, bus.direction);
    if (shape.length < 2) return;
    const busProgress = getProgressOnPolyline([bus.lat, bus.lng], shape);
    const speedMps = (bus.speed > 2 ? bus.speed : BUS_SPEED_KMH) * 1000 / 3600;
    const key = `${bus.routeId}_${bus.direction}`;
    if (!liveBusEta.has(key)) liveBusEta.set(key, new Map());
    const etaMap = liveBusEta.get(key)!;
    rd.stopIds.forEach((stopId) => {
      const stop = stopById.get(stopId);
      if (!stop) return;
      const stopProgress = getProgressOnPolyline([stop.lat, stop.lng], shape);
      if (stopProgress > busProgress - 0.0003) {
        const distMeters = Math.max(0, stopProgress - busProgress) * 111320;
        const etaSec = Math.round(distMeters / speedMps);
        const existing = etaMap.get(stopId);
        if (existing === undefined || etaSec < existing) etaMap.set(stopId, etaSec);
      }
    });
  });

  // ── RAPTOR Labels ──
  // best[stopId] = { arrivalTimeSec, transfers, prevLeg, prevStopId }
  const INF = 1e15;
  const best = new Map<string, StopLabel>();
  const initialize = (stopId: string): StopLabel => {
    if (!best.has(stopId)) best.set(stopId, { arrivalTimeSec: INF, transfers: INF, prevLeg: null, prevStopId: null, boardedRouteId: null });
    return best.get(stopId)!;
  };

  // Seed initial walk from origin stops
  const markedStops = new Set<string>();
  fromStops.forEach(({ stop, walkDist }) => {
    const walkSec = walkTimeSec(walkDist);
    const arrivalSec = departureTimeSec + walkSec;
    const label = initialize(stop.id);
    if (arrivalSec < label.arrivalTimeSec) {
      label.arrivalTimeSec = arrivalSec;
      label.transfers = 0;
      label.prevLeg = walkDist > 10 ? {
        isWalking: true, boardAt: 'origin', alightAt: stop.name,
        walkingDist: walkDist, walkingTime: Math.ceil(walkSec / 60), walkingTimeSec: walkSec
      } : null;
      label.prevStopId = null;
      markedStops.add(stop.id);
    }
  });

  // Destination stop ids for early termination
  const destStopIds = new Set(toStops.map(p => p.stop.id));

  // ── RAPTOR Rounds (one per transfer) ──
  const allLegsPerStop = new Map<string, TripLeg & { arrivalSec: number; transfers: number; fromStopId: string }[]>();

  for (let round = 0; round <= MAX_TRANSFERS; round++) {
    if (markedStops.size === 0) break;
    const newMarked = new Set<string>();

    // For each marked stop, scan all route-directions passing through it
    for (const stopId of markedStops) {
      const routeDirsHere = stopToRouteDirs.get(stopId) || [];
      for (const { rdIdx, pos } of routeDirsHere) {
        const rd = allRouteDirs[rdIdx];
        const boardLabel = best.get(stopId);
        if (!boardLabel || boardLabel.arrivalTimeSec === INF) continue;

        // Earliest boarding time at this stop
        const boardTimeSec = boardLabel.arrivalTimeSec;

        // Check live bus ETA to adjust boarding wait
        const busKey = `${rd.route.id}_${rd.direction}`;
        const etaMap = liveBusEta.get(busKey);
        let waitSec = 0;
        if (etaMap) {
          const eta = etaMap.get(stopId);
          if (eta !== undefined) {
            waitSec = eta; // wait for the live bus
          } else {
            // No live bus approaching — use average frequency penalty
            waitSec = 300; // 5 min average wait
          }
        } else {
          waitSec = 300;
        }

        const actualBoardSec = boardTimeSec + waitSec;

        // Ride forward from `pos` to all subsequent stops on this route-direction
        let runningTimeSec = actualBoardSec;
        const boardStop = stopById.get(stopId);

        for (let k = pos + 1; k < rd.stopIds.length; k++) {
          const alightStopId = rd.stopIds[k];
          const alightStop = stopById.get(alightStopId);
          if (!boardStop || !alightStop) continue;

          // Time between consecutive stops: haversine / bus speed
          const prevStopId = rd.stopIds[k - 1];
          const prevStop = stopById.get(prevStopId);
          if (!prevStop) {
            console.warn(`Missing previous stop ${prevStopId} for route ${rd.route.id} ${rd.direction}`);
            continue;
          }
          const segDist = haversineMeters(prevStop.lat, prevStop.lng, alightStop.lat, alightStop.lng);
          const segTimeSec = Math.round(segDist / (BUS_SPEED_KMH * 1000 / 3600));
          runningTimeSec += segTimeSec + 15; // 15s dwell per stop

          const alightLabel = initialize(alightStopId);
          const transfers = boardLabel.transfers + (round > 0 ? 0 : 0); // transfers tracked per round

          if (runningTimeSec < alightLabel.arrivalTimeSec ||
            (runningTimeSec === alightLabel.arrivalTimeSec && boardLabel.transfers < alightLabel.transfers)) {

            // Validate direction via polyline geometry
            const testLeg = {
              route: rd.route, direction: rd.direction,
              stopIds: rd.stopIds.slice(pos, k + 1),
              boardAt: boardStop.name, alightAt: alightStop.name,
              stops: rd.stopIds.slice(pos, k + 1).map((id: string) => stopById.get(id)?.name).filter(Boolean),
              numStops: k - pos
            };
            const legCoords = getLegCoords(testLeg);
            if (legCoords.length >= 2) {
              const progBoard = getProgressOnPolyline([boardStop.lat, boardStop.lng], legCoords);
              const progAlight = getProgressOnPolyline([alightStop.lat, alightStop.lng], legCoords);
              if (progBoard >= progAlight) continue; // wrong direction
            }

            // Find live bus for this leg
            let liveBusRef: any = null;
            let etaMinutes: number | undefined;
            const busEtaAtBoard = etaMap?.get(stopId);
            if (busEtaAtBoard !== undefined) {
              liveBusRef = liveBuses.find(b => b.routeId === rd.route.id && b.direction === rd.direction) || null;
              etaMinutes = Math.round(busEtaAtBoard / 60);
            }

            const leg: TripLeg = {
              route: rd.route,
              stops: testLeg.stops,
              stopIds: testLeg.stopIds,
              boardAt: boardStop.name,
              alightAt: alightStop.name,
              numStops: k - pos,
              direction: rd.direction,
              liveBus: liveBusRef,
              etaMinutes
            };

            alightLabel.arrivalTimeSec = runningTimeSec;
            alightLabel.transfers = round;
            alightLabel.prevLeg = leg;
            alightLabel.prevStopId = stopId;
            alightLabel.boardedRouteId = rd.route.id;
            newMarked.add(alightStopId);

            // Store in allLegsPerStop for path reconstruction
            if (!allLegsPerStop.has(alightStopId)) allLegsPerStop.set(alightStopId, []);
            allLegsPerStop.get(alightStopId)!.push({ ...leg, arrivalSec: runningTimeSec, transfers: round, fromStopId: stopId });
          }
        }
      }
    }

    // Footpath relaxation: from each newly reached stop, allow short walks to nearby stops
    const footpathCandidates = Array.from(newMarked);
    for (const stopId of footpathCandidates) {
      const fromLabel = best.get(stopId);
      if (!fromLabel || fromLabel.arrivalTimeSec === INF) continue;
      const fromStop = stopById.get(stopId);
      if (!fromStop) continue;

      BUS_STOPS.forEach((nearStop: any) => {
        if (nearStop.id === stopId) return;
        const walkDist = haversineMeters(fromStop.lat, fromStop.lng, nearStop.lat, nearStop.lng);
        if (walkDist > MAX_TRANSFER_WALK_METERS) return;

        const walkSec = walkTimeSec(walkDist);
        const arrivalViWalk = fromLabel.arrivalTimeSec + walkSec + TRANSFER_PENALTY_SEC;
        const nearLabel = initialize(nearStop.id);

        if (arrivalViWalk < nearLabel.arrivalTimeSec) {
          nearLabel.arrivalTimeSec = arrivalViWalk;
          nearLabel.transfers = fromLabel.transfers + 1;
          nearLabel.prevLeg = {
            isWalking: true, boardAt: fromStop.name, alightAt: nearStop.name,
            walkingDist: Math.round(walkDist), walkingTime: Math.ceil(walkSec / 60), walkingTimeSec: walkSec
          };
          nearLabel.prevStopId = stopId;
          newMarked.add(nearStop.id);
        }
      });
    }

    markedStops.clear();
    newMarked.forEach(s => markedStops.add(s));
  }

  // ── Path Reconstruction ──
  const reconstructPath = (destStopId: string): TripLeg[] => {
    const legs: TripLeg[] = [];
    let current = destStopId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) break;
      visited.add(current);
      const label = best.get(current);
      if (!label || !label.prevLeg) break;
      legs.unshift(label.prevLeg);
      current = label.prevStopId || '';
    }
    return legs;
  };

  // ── Collect Pareto-Optimal Solutions ──
  const candidates: TripOption[] = [];

  toStops.forEach(({ stop: destStop, walkDist: finalWalkDist }) => {
    const destLabel = best.get(destStop.id);
    if (!destLabel || destLabel.arrivalTimeSec === INF) return;

    const legs = reconstructPath(destStop.id);
    if (legs.length === 0) return;

    // Add final walk leg if needed
    if (finalWalkDist > 10) {
      legs.push({
        isWalking: true, boardAt: destStop.name, alightAt: 'destination',
        walkingDist: finalWalkDist,
        walkingTime: Math.ceil(walkTimeSec(finalWalkDist) / 60),
        walkingTimeSec: walkTimeSec(finalWalkDist)
      });
    }

    const busLegs = legs.filter(l => l.route);
    if (busLegs.length === 0) return;

    const totalWalkDist = legs.filter(l => l.isWalking).reduce((s, l) => s + (l.walkingDist || 0), 0);
    const totalTimeSec = destLabel.arrivalTimeSec + walkTimeSec(finalWalkDist) - departureTimeSec;
    const transfers = busLegs.length - 1;

    // Multi-criteria score (lower = better), mimicking Google Maps weighting:
    // Primarily: total time. Secondary: transfers. Tertiary: walk distance.
    const score = totalTimeSec + transfers * TRANSFER_PENALTY_SEC + totalWalkDist * 0.5;

    const departure = new Date(departureTimeSec * 1000);
    const arrival = new Date((departureTimeSec + totalTimeSec) * 1000);

    candidates.push({
      legs,
      totalTimeSec,
      walkDistMeters: totalWalkDist,
      transfers,
      departureTime: departure.toISOString(),
      arrivalTime: arrival.toISOString(),
      travelTime: Math.round(totalTimeSec / 60),
      totalPrice: busLegs.length * 40,
      score,
      from: '',
      to: '',
      isDirect: busLegs.length === 1,
      routeNames: busLegs.map(l => l.route?.name).filter(Boolean).join(' → ')
    });
  });

  // Also try paths through intermediate stop combinations from allLegsPerStop
  // This recovers paths that RAPTOR may have labelled suboptimally
  toStops.forEach(({ stop: destStop, walkDist: finalWalkDist }) => {
    const legsToHere = allLegsPerStop.get(destStop.id) || [];
    legsToHere.forEach(legEntry => {
      const boardStopLabel = best.get(legEntry.fromStopId);
      if (!boardStopLabel) return;
      const priorLegs = reconstructPath(legEntry.fromStopId);
      const fullLegs = [...priorLegs, legEntry as TripLeg];
      if (finalWalkDist > 10) {
        fullLegs.push({
          isWalking: true, boardAt: destStop.name, alightAt: 'destination',
          walkingDist: finalWalkDist, walkingTime: Math.ceil(walkTimeSec(finalWalkDist) / 60), walkingTimeSec: walkTimeSec(finalWalkDist)
        });
      }
      const busLegs = fullLegs.filter(l => l.route);
      if (busLegs.length === 0) return;
      const totalWalkDist = fullLegs.filter(l => l.isWalking).reduce((s, l) => s + (l.walkingDist || 0), 0);
      const totalTimeSec = legEntry.arrivalSec + walkTimeSec(finalWalkDist) - departureTimeSec;
      if (totalTimeSec <= 0) return;
      const transfers = busLegs.length - 1;
      const score = totalTimeSec + transfers * TRANSFER_PENALTY_SEC + totalWalkDist * 0.5;
      const departure = new Date(departureTimeSec * 1000);
      const arrival = new Date((departureTimeSec + totalTimeSec) * 1000);
      candidates.push({
        legs: fullLegs, totalTimeSec, walkDistMeters: totalWalkDist, transfers,
        departureTime: departure.toISOString(), arrivalTime: arrival.toISOString(),
        travelTime: Math.round(totalTimeSec / 60), totalPrice: busLegs.length * 40, score,
        from: '', to: '', isDirect: busLegs.length === 1,
        routeNames: busLegs.map(l => l.route?.name).filter(Boolean).join(' → ')
      });
    });
  });

  if (candidates.length === 0) return [];

  // ── Pareto Dominance Filter ──
  // Keep options that are not dominated on ALL criteria simultaneously
  const pareto = candidates.filter(c => {
    return !candidates.some(other =>
      other !== c &&
      other.totalTimeSec <= c.totalTimeSec &&
      other.transfers <= c.transfers &&
      other.walkDistMeters <= c.walkDistMeters &&
      (other.totalTimeSec < c.totalTimeSec || other.transfers < c.transfers || other.walkDistMeters < c.walkDistMeters)
    );
  });

  // Sort by score and deduplicate similar routes
  pareto.sort((a, b) => a.score - b.score);

  const deduped: TripOption[] = [];
  const seen = new Set<string>();
  for (const opt of pareto) {
    const key = opt.routeNames + '_' + opt.transfers;
    if (!seen.has(key)) { seen.add(key); deduped.push(opt); }
    if (deduped.length >= 4) break;
  }

  return deduped;
};

// ─── GEOCODING ────────────────────────────────────────────────────────────────
const geocodeAddress = async (query: string): Promise<{ lat: number; lng: number } | null> => {
  const stop = BUS_STOPS.find((s: any) => s.name.toLowerCase().trim() === query.toLowerCase().trim());
  if (stop) return { lat: stop.lat, lng: stop.lng };
  const suffix = query.toLowerCase().includes('tiran') || query.toLowerCase().includes('albania') ? '' : ', Tirana, Albania';
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + suffix)}&format=json&limit=3&countrycodes=al`,
      { headers: { 'User-Agent': 'UrbaniIm/2.0' } }
    );
    const data = await res.json();
    if (data?.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch (e) { console.error('Geocoding error:', e); }
  return null;
};

/** Get the N closest stops to a coordinate within maxDist meters */
const getNearestStops = (lat: number, lng: number, maxDist = MAX_WALK_METERS, maxCount = 8): { stop: any; walkDist: number }[] => {
  const scored = BUS_STOPS
    .map((s: any) => ({ stop: s, walkDist: Math.round(haversineMeters(lat, lng, s.lat, s.lng)) }))
    .filter(x => x.walkDist <= maxDist)
    .sort((a, b) => a.walkDist - b.walkDist)
    .slice(0, maxCount);
  if (scored.length === 0) {
    // Fallback: return closest 3 regardless of distance
    return BUS_STOPS
      .map((s: any) => ({ stop: s, walkDist: Math.round(haversineMeters(lat, lng, s.lat, s.lng)) }))
      .sort((a, b) => a.walkDist - b.walkDist)
      .slice(0, 3);
  }
  return scored;
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface StaffAccount {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: 'dispatcher' | 'operator' | 'driver' | 'inspector';
  routeId?: string;
  status: string;
}

// ─── STORE ────────────────────────────────────────────────────────────────────
const useStore = create<any>()(
  persist(
    (set, get) => ({
      // ── Auth ──
      user: { name: 'Admin', email: 'admin@busal.al', avatar: null },
      staffUser: null,
      isAuthenticated: true,
      guestMode: false,
      setGuestMode: (val: boolean) => set({ guestMode: val }),
      token: 'dev-token',
      login: (userData: any, token: any) => set({ user: userData, isAuthenticated: true, token }),
      loginAsStaff: (staffData: any) => set({ staffUser: staffData, isAuthenticated: true, user: null, currentView: 'staff_dashboard' }),
      logout: () => set({ user: null, staffUser: null, isAuthenticated: false, token: null, currentView: 'login' }),
      updateProfile: async (data: any) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set((state: any) => ({ user: { ...state.user, ...data } }));
        if (currentUser.id || currentUser._id) {
          try {
            const res = await fetch('/api/user/profile', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id || currentUser._id, ...data }),
            });
            if (!res.ok) throw new Error(`Profile sync failed (${res.status})`);
          } catch (error) {
            console.error('Failed to sync profile:', error);
          }
        }
      },

      // ── Language ──
      language: 'al',
      setLanguage: async (lang: string) => {
        set({ language: lang });
        try { await Preferences.set({ key: 'app_language', value: lang }); } catch { }
      },

      // ── Device + Network ──
      deviceInfo: null,
      networkStatus: { connected: true, connectionType: 'unknown' },
      appState: { isActive: true },
      initializeNativeServices: async () => {
        try {
          const [deviceInfo, networkStatus, appState] = await Promise.all([
            Device.getInfo(), Network.getStatus(), App.getState()
          ]);
          set({ deviceInfo, networkStatus, appState });
          Network.addListener('networkStatusChange', (status) => set({ networkStatus: status }));
          App.addListener('appStateChange', (state) => set({ appState: state }));
          try {
            await LocalNotifications.requestPermissions();
            await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
          } catch { }
        } catch (error) {
          console.warn('Native service initialization failed:', error);
        }
      },

      // ── UI State ──
      currentView: 'map',
      checkoutPackage: null,
      isSidebarOpen: false,
      showStops: true,
      showRoutes: true,
      showBuses: true,
      setView: (v: any) => set({ currentView: v, isSidebarOpen: false }),
      setCheckoutPackage: (pkg: any) => set({ checkoutPackage: pkg }),
      setShowStops: (val: boolean) => set({ showStops: val }),
      setShowRoutes: (val: boolean) => set({ showRoutes: val }),
      setShowBuses: (val: boolean) => set({ showBuses: val }),
      setSidebarOpen: (open: boolean) => set({ isSidebarOpen: open }),

      // ── Map Selection Mode ──
      selectingOnMap: null as 'from' | 'to' | null,
      setSelectingOnMap: (val: 'from' | 'to' | null) => set({ selectingOnMap: val }),

      // ── Admin Data ──
      adminDrivers: [],
      adminInspectors: [],
      adminBuses: [],
      setAdminDrivers: (drivers: any[]) => set({ adminDrivers: drivers }),
      setAdminInspectors: (inspectors: any[]) => set({ adminInspectors: inspectors }),
      setAdminBuses: (buses: any[]) => set({ adminBuses: buses }),
      fetchAdminDrivers: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=driver');
          const drivers = await res.json();
          set({ adminDrivers: Array.isArray(drivers) ? drivers : [] });
        } catch { set({ adminDrivers: [] }); }
      },
      fetchAdminInspectors: async () => {
        try {
          const res = await fetch('/api/admin/staff?role=inspector');
          const inspectors = await res.json();
          set({ adminInspectors: Array.isArray(inspectors) ? inspectors : [] });
        } catch { set({ adminInspectors: [] }); }
      },
      fetchAdminBuses: async () => {
        try {
          const res = await fetch('/api/admin/buses');
          const buses = await res.json();
          set({ adminBuses: Array.isArray(buses) ? buses : [] });
        } catch { set({ adminBuses: [] }); }
      },
      syncBusesWithAdmin: async () => {
        const { adminBuses, buses } = get();
        if (!Array.isArray(adminBuses)) return;
        const newBuses: any[] = [];
        const currentBuses = Array.isArray(buses) ? buses : [];
        for (const adminBus of adminBuses) {
          if (!adminBus || adminBus.status !== 'Aktiv') continue;
          const existingLocal = currentBuses.find((b: any) => b.id === adminBus.id);
          if (existingLocal) {
            newBuses.push({ ...existingLocal, routeId: adminBus.routeId, driverId: adminBus.driverId, inspectorId: adminBus.inspectorId });
            continue;
          }
          try {
            const res = await fetch(`/api/admin/buses?id=${adminBus.id}`);
            const existing = await res.json();
            if (existing && !existing.error) newBuses.push({ ...existing, routeId: adminBus.routeId, driverId: adminBus.driverId, inspectorId: adminBus.inspectorId });
          } catch (error) { console.error('Error syncing bus', error); }
        }
        set({ buses: newBuses });
      },

      // ── Buses ──
      buses: [],
      selectedBus: null,
      selectedRoute: null,
      userLocation: { lat: 41.3275, lng: 19.8187 },
      geolocationPermissionDenied: false,
      setUserLocation: (loc: { lat: number; lng: number }) => set({ userLocation: loc }),
      fetchBuses: async () => {
        try {
          const res = await fetch('/api/buses');
          if (!res.ok) throw new Error(`Buses fetch failed (${res.status})`);
          const buses = await res.json();
          if (Array.isArray(buses)) {
            const normalized = buses.map((bus: any) => ({
              ...bus,
              routeId: bus.routeId && !bus.routeId.startsWith('L') ? `L${bus.routeId}` : bus.routeId
            }));
            set({ buses: normalized });
          }
        } catch (error) { console.error('Failed to fetch buses:', error); }
      },
      updateBus: async (busData: any) => {
        try {
          const res = await fetch('/api/admin/buses', {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(busData),
          });
          if (res.ok) {
            const updatedBus = await res.json();
            set((state: any) => ({
              buses: Array.isArray(state.buses)
                ? state.buses.map((b: any) => b.id === updatedBus.id ? updatedBus : b)
                : [updatedBus]
            }));
          }
        } catch (error) { console.error('Failed to update bus', error); }
      },

      // ── Geolocation ──
      getCurrentPosition: async (options: any = {}) => {
        const mergedOptions = { enableHighAccuracy: true, timeout: 45000, maximumAge: 120000, ...options };
        const fallbackToBrowser = (): Promise<any> => new Promise((resolve, reject) => {
          if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(new Error('Geolocation not supported'));
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 45000, maximumAge: 300000 });
        });
        const tryNative = async (timeout: number): Promise<any> => {
          try {
            try { await Geolocation.requestPermissions(); } catch { }
            return await Geolocation.getCurrentPosition({ ...mergedOptions, timeout });
          } catch (err: any) {
            const msg = String(err?.message || '').toLowerCase();
            if ((msg.includes('timeout') || msg.includes('could not obtain')) && timeout < 60000) return tryNative(60000);
            throw err;
          }
        };
        if (Capacitor.isNativePlatform()) {
          try { return await tryNative(mergedOptions.timeout); } catch { return fallbackToBrowser(); }
        }
        return fallbackToBrowser();
      },
      fetchUserLocation: async () => {
        if (get().geolocationPermissionDenied) {
          const last = get().user?.lastLocation;
          if (last) set({ userLocation: { lat: last.lat, lng: last.lng } });
          return;
        }
        const applyLocation = (lat: number, lng: number) => {
          set({ userLocation: { lat, lng } });
          const user = get().user;
          if (user?.id || user?._id) {
            const now = new Date();
            get().updateProfile({ lastLocation: { lat, lng, updatedAt: new Date(now.getTime() + 2 * 3600000) } });
          }
        };
        try {
          const pos = await get().getCurrentPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
          applyLocation(pos.coords.latitude, pos.coords.longitude);
        } catch (error) {
          if (error instanceof GeolocationPositionError && error.code === 1) { set({ geolocationPermissionDenied: true }); return; }
          try {
            const pos = await get().getCurrentPosition({ enableHighAccuracy: false, timeout: 45000, maximumAge: 600000 });
            applyLocation(pos.coords.latitude, pos.coords.longitude);
          } catch (fallbackError) {
            if (fallbackError instanceof GeolocationPositionError && fallbackError.code === 1) { set({ geolocationPermissionDenied: true }); return; }
            const last = get().user?.lastLocation;
            set({ userLocation: last ? { lat: last.lat, lng: last.lng } : { lat: 41.3275, lng: 19.8187 } });
          }
        }
      },
      watchId: null as string | null,
      startTracking: async () => {
        if (get().geolocationPermissionDenied || get().watchId) return;
        const onPosition = (lat: number, lng: number) => set({ userLocation: { lat, lng } });
        const onError = (err: any) => {
          const msg = String(err?.message || err?.code || '').toLowerCase();
          if (msg.includes('permission') || err?.code === 1) { set({ geolocationPermissionDenied: true }); return; }
        };
        if (Capacitor.isNativePlatform()) {
          try {
            const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
              if (err) return onError(err);
              if (pos?.coords) onPosition(pos.coords.latitude, pos.coords.longitude);
            });
            set({ watchId: id }); return;
          } catch { }
        }
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
          const id = navigator.geolocation.watchPosition(
            (pos) => onPosition(pos.coords.latitude, pos.coords.longitude),
            onError,
            { enableHighAccuracy: true, timeout: 60000, maximumAge: 600000 }
          );
          set({ watchId: id });
        }
      },
      stopTracking: async () => {
        const { watchId } = get();
        if (!watchId) return;
        if (Capacitor.isNativePlatform()) { try { await Geolocation.clearWatch({ id: watchId }); } catch { } }
        else if (typeof navigator !== 'undefined') navigator.geolocation.clearWatch(watchId as number);
        set({ watchId: null });
      },
      findNearestStop: (lat: number, lng: number) => {
        return BUS_STOPS.reduce((nearest: any, stop: any) => {
          const d = haversineMeters(lat, lng, stop.lat, stop.lng);
          const nd = haversineMeters(lat, lng, nearest.lat, nearest.lng);
          return d < nd ? stop : nearest;
        }, BUS_STOPS[0]);
      },
      setSelectedBus: (bus: any) => set({ selectedBus: bus }),
      setSelectedRoute: (route: any) => set({ selectedRoute: route }),
      selectedStop: null,
      setSelectedStop: (stop: any) => set({ selectedStop: stop }),

      // ── Traffic Zones ──
      trafficZones: [
        { id: 'tz1', name: 'Zogu i Zi', lat: 41.3323, lng: 19.8078, radius: 0.003, intensity: 0.8 },
        { id: 'tz2', name: 'Qendra', lat: 41.3275, lng: 19.8187, radius: 0.004, intensity: 0.6 },
        { id: 'tz3', name: '21 Dhjetori', lat: 41.3265, lng: 19.8030, radius: 0.002, intensity: 0.7 },
      ],

      // ── Bus Simulation ──
      moveBuses: () => {
        const { buses, trafficZones } = get();
        const hour = new Date().getHours();
        const isPeak = (hour >= 8 && hour <= 9) || (hour >= 16 && hour <= 18);

        const updated = buses.map((bus: any) => {
          if (bus.waitingTicks > 0) return { ...bus, waitingTicks: bus.waitingTicks - 1, status: 'stopped' };

          const ticks = (bus.ticks || 0) + 1;
          const route = BUS_ROUTES.find((r: any) => r.id === bus.routeId);
          if (!route) return bus;

          const isReturn = bus.direction === 'return';
          const sIds = isReturn ? (route.returnStops || [...route.stops].reverse()) : route.stops;

          // Smart shape selection
          const shape0: [number, number][] = BUS_SHAPES[`${route.id}_0` as keyof typeof BUS_SHAPES] || [];
          const shape1: [number, number][] = BUS_SHAPES[`${route.id}_1` as keyof typeof BUS_SHAPES] || [];
          const mainShape: [number, number][] = (BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][]) || [];

          let coords: [number, number][] = [];
          const startStop = BUS_STOPS.find((s: any) => s.id === sIds[0]);
          const endStop = BUS_STOPS.find((s: any) => s.id === sIds[sIds.length - 1]);

          if (startStop && endStop) {
            const dist0 = shape0.length > 0 ? haversineMeters(shape0[0][0], shape0[0][1], startStop.lat, startStop.lng) : Infinity;
            const dist1 = shape1.length > 0 ? haversineMeters(shape1[0][0], shape1[0][1], startStop.lat, startStop.lng) : Infinity;
            if (dist0 < dist1 && dist0 < 50) coords = shape0;
            else if (dist1 < dist0 && dist1 < 50) coords = shape1;
            else if (mainShape.length > 0) coords = isReturn ? [...mainShape].reverse() : mainShape;
          }

          if (coords.length === 0) coords = BUS_SHAPES[`${route.id}_${isReturn ? '1' : '0'}` as keyof typeof BUS_SHAPES] || [];
          if (coords.length === 0 && isReturn) {
            const fw = (BUS_SHAPES[`${route.id}_0` as keyof typeof BUS_SHAPES] || BUS_SHAPES[route.id as keyof typeof BUS_SHAPES]) as [number, number][] || [];
            if (fw.length > 0) coords = [...fw].reverse();
          }
          if (coords.length === 0) coords = sIds.map((id: string) => BUS_STOPS.find((s: any) => s.id === id)).filter(Boolean).map((s: any) => [s.lat, s.lng]);
          if (coords.length < 2) return bus;

          const currentIdx = typeof bus.currentPointIdx === 'number' ? bus.currentPointIdx : 0;
          const nextIdx = currentIdx + 1;

          if (nextIdx >= coords.length || !coords[nextIdx]) {
            return { ...bus, currentPointIdx: 0, direction: isReturn ? 'forward' : 'return', lat: coords[0][0], lng: coords[0][1], lastUpdate: Date.now(), ticks: 0 };
          }

          const target = coords[nextIdx];

          // Traffic speed multiplier
          let speedMult = 1.0;
          trafficZones.forEach((zone: any) => {
            const d = haversineMeters(bus.lat, bus.lng, zone.lat, zone.lng);
            if (d < zone.radius * 111320) speedMult = Math.min(speedMult, 1.0 - zone.intensity);
          });

          const dlat = target[0] - bus.lat, dlng = target[1] - bus.lng;
          const dist = Math.sqrt(dlat * dlat + dlng * dlng);

          let currentSpeed = bus.speed;
          if (ticks % 30 === 0) currentSpeed = 35 * speedMult * (0.8 + Math.random() * 0.4);

          if (dist < 0.0001) {
            const currentStop = BUS_STOPS.find((s: any) => haversineMeters(s.lat, s.lng, target[0], target[1]) < 25);
            let waitingTicks = 0, newLoad = bus.passengerLoad;
            if (currentStop) {
              waitingTicks = 30;
              newLoad = Math.max(2, Math.min(50, newLoad + (Math.floor(Math.random() * 7) - 3) + (isPeak ? Math.floor(Math.random() * 4) : 0)));
            }
            const nextStops = sIds.map((id: string) => BUS_STOPS.find((s: any) => s.id === id)).filter(Boolean);
            const nearestNext = nextStops.reduce((best: any, s: any) => {
              const d = haversineMeters(s.lat, s.lng, target[0], target[1]);
              const bd = haversineMeters(best.lat, best.lng, target[0], target[1]);
              return d < bd ? s : best;
            }, nextStops[0]);
            return {
              ...bus, currentPointIdx: nextIdx, lat: target[0], lng: target[1], passengerLoad: newLoad,
              waitingTicks, nextStop: nearestNext?.name || bus.nextStop, currentStop: currentStop?.name || bus.currentStop,
              status: waitingTicks > 0 ? 'stopped' : 'moving',
              delay: speedMult < 0.5 ? (bus.delay + 0.05) : Math.max(0, bus.delay - 0.05),
              lastUpdate: Date.now(), ticks, speed: waitingTicks > 0 ? 0 : currentSpeed
            };
          }

          const baseStep = 0.00003 * speedMult;
          return { ...bus, lat: bus.lat + (dlat / dist) * baseStep, lng: bus.lng + (dlng / dist) * baseStep, speed: currentSpeed, status: 'moving', ticks };
        });
        set({ buses: updated });
      },

      // ── Trip Planner (RAPTOR-based, Google Maps-level) ──
      tripResult: null,
      activeTrip: null,
      tripOriginCoords: null as { lat: number; lng: number } | null,
      tripOriginName: '',
      setTripOriginCoords: (coords: any, name = '') => set({ tripOriginCoords: coords, tripOriginName: name }),
      tripDestCoords: null as { lat: number; lng: number } | null,
      tripDestName: '',
      setTripDestCoords: (coords: any, name = '') => set({ tripDestCoords: coords, tripDestName: name }),
      tripFrom: '',
      tripTo: '',
      setTripFrom: (v: any) => {
        set({ tripFrom: v });
        if (v !== get().tripOriginName) set({ tripOriginCoords: null, tripOriginName: '' });
      },
      setTripTo: (v: any) => {
        set({ tripTo: v });
        if (v !== get().tripDestName) set({ tripDestCoords: null, tripDestName: '' });
      },
      setTripResult: (v: any) => set({ tripResult: v }),
      tripOptions: [] as TripOption[],
      selectedTripOptionIndex: 0,
      tripDepartureMode: 'now' as 'now' | 'depart_at' | 'arrive_by',
      tripDepartureTime: new Date().toISOString().slice(0, 16),
      setTripOptions: (options: TripOption[]) => set({ tripOptions: options }),
      setSelectedTripOptionIndex: (idx: number) => set({ selectedTripOptionIndex: idx }),
      setTripDepartureMode: (mode: 'now' | 'depart_at' | 'arrive_by') => set({ tripDepartureMode: mode }),
      setTripDepartureTime: (time: string) => set({ tripDepartureTime: time }),
      setActiveTrip: (trip: any) => set({ activeTrip: trip }),

      planTrip: async (fromName: string, toName: string) => {
        console.log('🔍 planTrip started:', { fromName, toName });

        const departureMode = get().tripDepartureMode;
        const isArriveBy = departureMode === 'arrive_by';
        const desiredTime = (departureMode !== 'now' && get().tripDepartureTime)
          ? new Date(get().tripDepartureTime) : new Date();
        const departureTimeSec = Math.floor(desiredTime.getTime() / 1000);

        // ── 1. Resolve origin coordinates ──
        const isMyLocation = ['vendndodhja', 'my location', 'location'].some(k => fromName.toLowerCase().includes(k));
        const storedOriginMatch = get().tripOriginName === fromName && get().tripOriginCoords;

        let fromCoords: { lat: number; lng: number } | null = storedOriginMatch ? get().tripOriginCoords : null;
        if (!fromCoords) {
          if (isMyLocation) {
            fromCoords = get().userLocation;
          } else {
            fromCoords = await geocodeAddress(fromName);
          }
        }
        if (!fromCoords) {
          set({ tripResult: { error: 'Adresa e nisjes nuk u gjet. Provo një adresë tjetër ose emër stacioni.' }, activeTrip: null });
          return;
        }
        set({ tripOriginCoords: fromCoords, tripOriginName: fromName });

        // ── 2. Resolve destination coordinates ──
        const storedDestMatch = get().tripDestName === toName && get().tripDestCoords;
        let toCoords: { lat: number; lng: number } | null = storedDestMatch ? get().tripDestCoords : null;
        if (!toCoords) toCoords = await geocodeAddress(toName);
        if (!toCoords) {
          set({ tripResult: { error: 'Adresa e destinacionit nuk u gjet. Provo një adresë tjetër ose emër stacioni.' }, activeTrip: null });
          return;
        }
        set({ tripDestCoords: toCoords, tripDestName: toName });

        // ── 3. Find candidate stops near origin and destination ──
        const fromStops = getNearestStops(fromCoords.lat, fromCoords.lng, MAX_WALK_METERS, 8);
        const toStops = getNearestStops(toCoords.lat, toCoords.lng, MAX_WALK_METERS, 8);

        if (fromStops.length === 0 || toStops.length === 0) {
          set({ tripResult: { error: 'Nuk u gjetën stacione afër vendndodhjes suaj.' }, activeTrip: null });
          return;
        }

        // ── 4. Use RAPTOR router ──
        const liveBuses = get().buses || [];
        const options = runRaptorRouter(fromStops, toStops, departureTimeSec, isArriveBy, liveBuses);

        if (options.length === 0) {
          set({ tripResult: { error: 'Nuk u gjet asnjë rrugë e mundshme. Provo destinacion tjetër ose koha e udhëtimit mund të jetë jashtë orarit.' }, activeTrip: null, tripOptions: [], selectedTripOptionIndex: 0 });
          return;
        }

        // ── 5. Enrich legs with named origin/destination and walk legs at ends ──
        const enrichedOptions = options.map((opt, index) => {
          const legs = [...opt.legs];

          // Replace 'origin' / 'destination' placeholders with actual names
          if (legs[0]?.isWalking && legs[0].boardAt === 'origin') {
            legs[0] = { ...legs[0], boardAt: fromName };
          } else if (!legs[0]?.isWalking) {
            // Add initial walk leg if user is not at a stop
            const boardStopName = legs[0].boardAt!;
            const boardStop = BUS_STOPS.find((s: any) => s.name === boardStopName);
            if (boardStop) {
              const walkDist = Math.round(haversineMeters(fromCoords!.lat, fromCoords!.lng, boardStop.lat, boardStop.lng));
              if (walkDist > 20) {
                legs.unshift({ isWalking: true, boardAt: fromName, alightAt: boardStopName, walkingDist: walkDist, walkingTime: Math.ceil(walkTimeSec(walkDist) / 60), walkingTimeSec: walkTimeSec(walkDist) });
              }
            }
          }

          const lastLeg = legs[legs.length - 1];
          if (lastLeg?.isWalking && lastLeg.alightAt === 'destination') {
            legs[legs.length - 1] = { ...lastLeg, alightAt: toName };
          } else if (!lastLeg?.isWalking) {
            const alightStopName = lastLeg.alightAt!;
            const alightStop = BUS_STOPS.find((s: any) => s.name === alightStopName);
            if (alightStop) {
              const walkDist = Math.round(haversineMeters(toCoords!.lat, toCoords!.lng, alightStop.lat, alightStop.lng));
              if (walkDist > 20) {
                legs.push({ isWalking: true, boardAt: alightStopName, alightAt: toName, walkingDist: walkDist, walkingTime: Math.ceil(walkTimeSec(walkDist) / 60), walkingTimeSec: walkTimeSec(walkDist) });
              }
            }
          }

          return {
            ...opt,
            legs,
            from: fromName,
            to: toName,
            optionIndex: index + 1,
          };
        });

        const selected = enrichedOptions[0];
        console.log('✅ Trip options found:', enrichedOptions.length, enrichedOptions.map(o => ({ routes: o.routeNames, time: o.travelTime, transfers: o.transfers })));

        set({
          tripResult: selected,
          tripOptions: enrichedOptions,
          selectedTripOptionIndex: 0,
          activeTrip: selected,
          showRoutes: true,
          showBuses: true
        });
      },

      isSplashFinished: false,
      setSplashFinished: (val: boolean) => set({ isSplashFinished: val }),

      // ── Notifications ──
      notifications: [],
      addNotification: (msg: string, type = 'info') => {
        const id = Date.now() + Math.random();
        set((state: any) => ({ notifications: [...state.notifications, { id, msg, type }] }));
      },
      removeNotification: (id: number) => {
        set((state: any) => ({ notifications: state.notifications.filter((n: any) => n.id !== id) }));
      },

      // ── Saved Routes ──
      savedRoutes: [],
      saveRoute: (route: any) => set((state: any) => ({
        savedRoutes: state.savedRoutes.find((r: any) => r.id === route.id)
          ? state.savedRoutes : [...state.savedRoutes, route]
      })),
      removeSavedRoute: (routeId: string) => set((state: any) => ({
        savedRoutes: state.savedRoutes.filter((r: any) => r.id !== routeId)
      })),

      // ── Filter ──
      activeFilter: 'all',
      setActiveFilter: (f: string) => set({ activeFilter: f }),
      searchQuery: '',
      setSearchQuery: (q: string) => set({ searchQuery: q }),
    }),
    {
      name: 'urbani-im-storage-v2',
      partialize: (state) => Object.fromEntries(
        Object.entries(state).filter(([key]) => ![
          'searchQuery', 'tripFrom', 'tripTo', 'tripResult',
          'tripOptions', 'selectedTripOptionIndex', 'activeTrip',
          'selectedStop', 'activeRouteFilter', 'currentView', 'isSidebarOpen'
        ].includes(key))
      ),
    }
  )
);

export default useStore;