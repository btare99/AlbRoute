import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Network } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUS_ROUTES, BUS_STOPS } from '../constants/busData';
import { BUS_SHAPES } from './busShapes';
import { WalkingEngine } from '../lib/engines/walkingEngine';
export { BUS_ROUTES, BUS_STOPS };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WALK_SPEED_MPS = 1.4;    // 1.4 m/s ≈ 5 km/h walking speed
const BUS_SPEED_KMH = 30;     // average urban bus speed km/h
const BUS_DWELL_SEC = 20;     // stop dwell time per stop (seconds)
const MAX_WALK_METERS = 1200;   // max walk to/from a terminal stop
const MAX_TRANSFER_WALK_METERS = 700;  // max walk between transfer stops (tighter)
const MAX_TRANSFERS = 3;      // max allowed transfers
const AVG_WAIT_SEC = 300;    // average bus wait when no live data (5 min)

// Transfer penalties (seconds added to effective arrival time)
const TRANSFER_PENALTY_SEC = 360;  // base penalty per transfer
const SHORT_LEG_1STOP_PENALTY_SEC = 900;  // heavy penalty for 1-stop legs in a transfer
// FIX 2: 420 → 120 — penalizimi i vjetër bënte transferimet pothuajse të pamundura
const SHORT_LEG_2STOP_PENALTY_SEC = 120;  // moderate penalty for 2-stop legs in a transfer
const MIN_TRANSFER_LEG_STOPS = 2;    // minimum stops on any transfer leg (enforced hard)

// Direction & progress thresholds
// FIX 1: 1.4 → 1.9 — rrugët me transferim shpesh shkojnë pak "larg" para se të kthehen
const PROGRESS_DETOUR_RATIO = 1.9;   // alight stop may be at most 90% farther than board stop from dest
const PROGRESS_MIN_STOPS = 2;     // only apply progress check after this many stops on leg
const WALK_DISTANCE_THRESHOLD = 20;   // minimum walk distance (meters) to add walking leg

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
  const boardStop = boardStopId ? BUS_STOPS.find((s: any) => s.id === boardStopId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.boardAt?.toLowerCase().trim());
  const alightStop = alightStopId ? BUS_STOPS.find((s: any) => s.id === alightStopId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.alightAt?.toLowerCase().trim());
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
      legCoords = leg.stops.map((name: string) => { const s = BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === name?.toLowerCase().trim()); return s ? [s.lat, s.lng] : null; }).filter(Boolean) as [number, number][];
    }
  }
  return legCoords;
};

/** Get full shape for a route direction */
const getFullShapeCoords = (routeId: string, direction: 'forward' | 'return'): [number, number][] => {
  const route = BUS_ROUTES.find((r: any) => r.id === routeId);
  if (!route) return [];

  const stopIds = direction === 'forward' ? route.stops : (route.returnStops || route.stops);
  const shape0 = (BUS_SHAPES[`${routeId}_0` as keyof typeof BUS_SHAPES] || []) as [number, number][];
  const shape1 = (BUS_SHAPES[`${routeId}_1` as keyof typeof BUS_SHAPES] || []) as [number, number][];

  if (!stopIds || stopIds.length < 2) {
    return shape0;
  }

  const startStop = BUS_STOPS.find((s: any) => s.id === stopIds[0]);
  const endStop = BUS_STOPS.find((s: any) => s.id === stopIds[stopIds.length - 1]);
  if (!startStop || !endStop) {
    return shape0;
  }

  let is0Forward = false;
  if (shape0.length >= 2) {
    const pStart = getProgressOnPolyline([startStop.lat, startStop.lng], shape0);
    const pEnd = getProgressOnPolyline([endStop.lat, endStop.lng], shape0);
    if (pStart < pEnd) is0Forward = true;
  }

  let is1Forward = false;
  if (shape1.length >= 2) {
    const pStart = getProgressOnPolyline([startStop.lat, startStop.lng], shape1);
    const pEnd = getProgressOnPolyline([endStop.lat, endStop.lng], shape1);
    if (pStart < pEnd) is1Forward = true;
  }

  if (is1Forward) return shape1;
  if (is0Forward) return shape0;

  // Fallback
  const shapeKey = direction === 'forward' ? `${routeId}_0` : `${routeId}_1`;
  let coords: [number, number][] = (BUS_SHAPES[shapeKey as keyof typeof BUS_SHAPES] || []) as [number, number][];
  if (coords.length === 0 && direction === 'forward') coords = ((BUS_SHAPES[routeId as keyof typeof BUS_SHAPES] || []) as [number, number][]);
  return coords;
};

// ─── TRIP PLANNING ENGINE ─────────────────────────────────────────────────────
interface StopLabel {
  arrivalTimeSec: number;
  transfers: number;
  prevLeg: TripLeg | null;
  prevStopId: string | null;
  boardedRouteId: string | null;
  reachedByWalk: boolean;
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
  walkingTime?: number;
  walkingTimeSec?: number;
  liveBus?: any;
  etaMinutes?: number;
  boardNodeId?: string;
  alightNodeId?: string;
  waypoints?: [number, number][];
}

interface TripOption {
  legs: TripLeg[];
  totalTimeSec: number;
  walkDistMeters: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
  travelTime: number;
  totalPrice: number;
  score: number;
  optionIndex?: number;
  from: string;
  to: string;
  isDirect: boolean;
  routeNames: string;
}

// ─────────────────────────────────────────────────────────────────────────────
const runRaptorRouter = (
  fromStops: { stop: any; walkDist: number }[],
  toStops: { stop: any; walkDist: number }[],
  departureTimeSec: number,
  isArriveBy: boolean,
  liveBuses: any[]
): TripOption[] => {

  const stopById = new Map<string, any>();
  BUS_STOPS.forEach((s: any) => stopById.set(s.id, s));

  interface RouteDir { stopIds: string[]; direction: 'forward' | 'return'; route: any; }
  const allRouteDirs: RouteDir[] = [];
  BUS_ROUTES.forEach((route: any) => {
    if (route.stops?.length > 1) {
      const valid = route.stops.every((id: string) => stopById.has(id));
      if (valid) allRouteDirs.push({ stopIds: route.stops, direction: 'forward', route });
      else console.warn(`Skipping forward route ${route.id}: missing stop(s)`);
    }
    if (route.returnStops?.length > 1) {
      const valid = route.returnStops.every((id: string) => stopById.has(id));
      if (valid) allRouteDirs.push({ stopIds: route.returnStops, direction: 'return', route });
      else console.warn(`Skipping return route ${route.id}: missing stop(s)`);
    }
  });

  const stopToRouteDirs = new Map<string, { rdIdx: number; pos: number }[]>();
  allRouteDirs.forEach((rd, rdIdx) => {
    rd.stopIds.forEach((stopId, pos) => {
      if (!stopToRouteDirs.has(stopId)) stopToRouteDirs.set(stopId, []);
      stopToRouteDirs.get(stopId)!.push({ rdIdx, pos });
    });
  });

  const destCentroid = {
    lat: toStops.reduce((s, p) => s + p.stop.lat, 0) / toStops.length,
    lng: toStops.reduce((s, p) => s + p.stop.lng, 0) / toStops.length,
  };
  const destStopIds = new Set(toStops.map(p => p.stop.id));

  const liveBusEta = new Map<string, Map<string, number>>();
  liveBuses.forEach((bus: any) => {
    if (!bus || !bus.routeId || !bus.direction || !bus.lat || !bus.lng) return;
    const rd = allRouteDirs.find(r => r.route.id === bus.routeId && r.direction === bus.direction);
    if (!rd) return;
    const shape = getFullShapeCoords(bus.routeId, bus.direction);
    if (shape.length < 2) return;
    const busProgress = getProgressOnPolyline([bus.lat, bus.lng], shape);
    const speedMps = bus.speed > 50 ? bus.speed : Math.max(bus.speed || BUS_SPEED_KMH, BUS_SPEED_KMH) * 1000 / 3600;
    const key = bus.routeId && bus.direction ? `${bus.routeId}_${bus.direction}` : null;
    if (!key) return;
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

  const INF = 1e15;
  const best = new Map<string, StopLabel>();

  const getOrInit = (stopId: string): StopLabel => {
    if (!best.has(stopId)) {
      best.set(stopId, {
        arrivalTimeSec: INF,
        transfers: INF,
        prevLeg: null,
        prevStopId: null,
        boardedRouteId: null,
        reachedByWalk: false,
      });
    }
    return best.get(stopId)!;
  };

  const markedStops = new Set<string>();
  fromStops.forEach(({ stop, walkDist }) => {
    const walkSec = walkTimeSec(walkDist);
    const arrivalSec = departureTimeSec + walkSec;
    const label = getOrInit(stop.id);
    if (arrivalSec < label.arrivalTimeSec) {
      label.arrivalTimeSec = arrivalSec;
      label.transfers = 0;
      label.prevLeg = walkDist > WALK_DISTANCE_THRESHOLD
        ? { isWalking: true, boardAt: 'origin', alightAt: stop.name, alightNodeId: stop.id, walkingDist: walkDist, walkingTime: Math.ceil(walkSec / 60), walkingTimeSec: walkSec }
        : null;
      label.prevStopId = null;
      label.boardedRouteId = null;
      label.reachedByWalk = walkDist > 10;
      markedStops.add(stop.id);
    }
  });

  for (let round = 0; round <= MAX_TRANSFERS; round++) {
    if (markedStops.size === 0) break;
    const newMarked = new Set<string>();

    for (const stopId of markedStops) {
      const routeDirsHere = stopToRouteDirs.get(stopId) || [];

      for (const { rdIdx, pos } of routeDirsHere) {
        const rd = allRouteDirs[rdIdx];
        const boardLabel = best.get(stopId);
        if (!boardLabel || boardLabel.arrivalTimeSec === INF) continue;

        const prevRouteId = boardLabel.boardedRouteId;
        const isTransfer = prevRouteId !== null && prevRouteId !== rd.route.id;

        if (isTransfer && boardLabel.transfers >= MAX_TRANSFERS) continue;

        const boardStop = stopById.get(stopId);
        if (!boardStop) continue;

        if (!rd.route || !rd.route.id) continue;
        const busKey = `${rd.route.id}_${rd.direction}`;
        const etaMap = liveBusEta.get(busKey);
        let waitSec = AVG_WAIT_SEC;
        if (etaMap) {
          const eta = etaMap.get(stopId);
          waitSec = eta !== undefined ? eta : AVG_WAIT_SEC;
        }

        const transferPenaltySec = isTransfer ? TRANSFER_PENALTY_SEC : 0;
        const effectiveBoardSec = boardLabel.arrivalTimeSec + waitSec + transferPenaltySec;
        const nextTransfers = boardLabel.transfers + (isTransfer ? 1 : 0);

        let routeTravelSec = 0;
        for (let k = pos + 1; k < rd.stopIds.length; k++) {
          const alightStopId = rd.stopIds[k];
          const alightStop = stopById.get(alightStopId);
          if (!alightStop) continue;

          const numStops = k - pos;
          const isDestStop = destStopIds.has(alightStopId);

          if (isTransfer && numStops < MIN_TRANSFER_LEG_STOPS && !isDestStop) continue;

          const prevStopId = rd.stopIds[k - 1];
          const prevStop = stopById.get(prevStopId);
          if (!prevStop) continue;
          const segDist = haversineMeters(prevStop.lat, prevStop.lng, alightStop.lat, alightStop.lng);
          const segTimeSec = Math.round(segDist / (BUS_SPEED_KMH * 1000 / 3600));
          routeTravelSec += segTimeSec + BUS_DWELL_SEC;

          // FIX 2: SHORT_LEG_2STOP_PENALTY_SEC tani është 120 (ishte 420)
          let shortLegPenalty = 0;
          if (isTransfer) {
            if (numStops === 2 && !isDestStop) shortLegPenalty = SHORT_LEG_2STOP_PENALTY_SEC;
          }

          const runningTimeSec = effectiveBoardSec + routeTravelSec + shortLegPenalty;

          const alightLabel = getOrInit(alightStopId);

          const improves = runningTimeSec < alightLabel.arrivalTimeSec ||
            (runningTimeSec === alightLabel.arrivalTimeSec && nextTransfers < alightLabel.transfers);
          if (!improves) continue;

          const testLeg: TripLeg = {
            route: rd.route,
            direction: rd.direction,
            stopIds: rd.stopIds.slice(pos, k + 1),
            boardAt: boardStop.name,
            alightAt: alightStop.name,
            stops: rd.stopIds.slice(pos, k + 1).map((id: string) => stopById.get(id)?.name).filter(Boolean),
            numStops,
          };
          const legCoords = getLegCoords(testLeg);
          if (legCoords.length >= 2) {
            const progBoard = getProgressOnPolyline([boardStop.lat, boardStop.lng], legCoords);
            const progAlight = getProgressOnPolyline([alightStop.lat, alightStop.lng], legCoords);
            if (progBoard >= progAlight) continue;
          }

          // FIX 1: PROGRESS_DETOUR_RATIO tani është 1.9 (ishte 1.4)
          if (numStops >= PROGRESS_MIN_STOPS && !isDestStop) {
            const dBoard = haversineMeters(boardStop.lat, boardStop.lng, destCentroid.lat, destCentroid.lng);
            const dAlight = haversineMeters(alightStop.lat, alightStop.lng, destCentroid.lat, destCentroid.lng);
            if (dAlight > dBoard * PROGRESS_DETOUR_RATIO) continue;
          }

          let liveBusRef: any = null;
          let etaMinutes: number | undefined;
          if (etaMap) {
            const busEtaAtBoard = etaMap.get(stopId);
            if (busEtaAtBoard !== undefined) {
              liveBusRef = liveBuses.find(b => b.routeId === rd.route.id && b.direction === rd.direction) || null;
              etaMinutes = Math.round(busEtaAtBoard / 60);
            }
          }

          alightLabel.arrivalTimeSec = runningTimeSec;
          alightLabel.transfers = nextTransfers;
          alightLabel.prevLeg = { ...testLeg, liveBus: liveBusRef, etaMinutes };
          alightLabel.prevStopId = stopId;
          alightLabel.boardedRouteId = rd.route.id;
          alightLabel.reachedByWalk = false;
          newMarked.add(alightStopId);
        }
      }
    }

    const footpathCandidates = Array.from(newMarked);
    for (const stopId of footpathCandidates) {
      const fromLabel = best.get(stopId);
      if (!fromLabel || fromLabel.arrivalTimeSec === INF) continue;
      if (fromLabel.reachedByWalk) continue;

      const fromStop = stopById.get(stopId);
      if (!fromStop) continue;

      BUS_STOPS.forEach((nearStop: any) => {
        if (nearStop.id === stopId) return;
        const walkDist = haversineMeters(fromStop.lat, fromStop.lng, nearStop.lat, nearStop.lng);
        if (walkDist > MAX_TRANSFER_WALK_METERS) return;

        const walkSec = walkTimeSec(walkDist);
        const arrivalViaWalk = fromLabel.arrivalTimeSec + walkSec;
        const nearLabel = getOrInit(nearStop.id);

        if (arrivalViaWalk < nearLabel.arrivalTimeSec) {
          nearLabel.arrivalTimeSec = arrivalViaWalk;
          nearLabel.transfers = fromLabel.transfers;
          nearLabel.prevLeg = {
            isWalking: true,
            boardAt: fromStop.name,
            alightAt: nearStop.name,
            boardNodeId: fromStop.id,
            alightNodeId: nearStop.id,
            walkingDist: Math.round(walkDist),
            walkingTime: Math.ceil(walkSec / 60),
            walkingTimeSec: walkSec,
          };
          nearLabel.prevStopId = stopId;
          nearLabel.boardedRouteId = fromLabel.boardedRouteId;
          nearLabel.reachedByWalk = true;
          newMarked.add(nearStop.id);
        }
      });
    }

    markedStops.clear();
    newMarked.forEach(s => markedStops.add(s));
  }

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

  const candidates: TripOption[] = [];

  toStops.forEach(({ stop: destStop, walkDist: finalWalkDist }) => {
    const destLabel = best.get(destStop.id);
    if (!destLabel || destLabel.arrivalTimeSec === INF) return;

    const legs = reconstructPath(destStop.id);
    if (legs.length === 0) return;

    if (finalWalkDist > WALK_DISTANCE_THRESHOLD) {
      legs.push({
        isWalking: true,
        boardAt: destStop.name,
        alightAt: 'destination',
        boardNodeId: destStop.id,
        walkingDist: finalWalkDist,
        walkingTime: Math.ceil(walkTimeSec(finalWalkDist) / 60),
        walkingTimeSec: walkTimeSec(finalWalkDist),
      });
    }

    const busLegs = legs.filter(l => l.route);
    if (busLegs.length === 0) return;

    const totalWalkDist = legs.filter(l => l.isWalking).reduce((s, l) => s + (l.walkingDist || 0), 0);
    const totalTimeSec = destLabel.arrivalTimeSec + walkTimeSec(finalWalkDist) - departureTimeSec;
    if (totalTimeSec <= 0) return;

    const transfers = busLegs.length - 1;
    const score = totalTimeSec + totalWalkDist * 0.5 + transfers * TRANSFER_PENALTY_SEC;

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
      routeNames: busLegs.map(l => l.route?.name).filter(Boolean).join(' → '),
    });
  });

  if (candidates.length === 0) return [];

  const pareto = candidates.filter(c =>
    !candidates.some(other =>
      other !== c &&
      other.totalTimeSec <= c.totalTimeSec &&
      other.transfers <= c.transfers &&
      other.walkDistMeters <= c.walkDistMeters &&
      (other.totalTimeSec < c.totalTimeSec ||
        other.transfers < c.transfers ||
        other.walkDistMeters < c.walkDistMeters)
    )
  );

  pareto.sort((a, b) => a.score - b.score);

  const deduped: TripOption[] = [];
  const seen = new Set<string>();
  for (const opt of pareto) {
    const key = opt.routeNames + '_' + opt.transfers;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(opt);
    }
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
    return BUS_STOPS
      .map((s: any) => ({ stop: s, walkDist: Math.round(haversineMeters(lat, lng, s.lat, s.lng)) }))
      .sort((a, b) => a.walkDist - b.walkDist)
      .slice(0, maxCount);
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

const MAX_WALK_METERS_BASE = 1200;
const MAX_WALK_METERS_LONG = 1600;
const LONG_TRIP_THRESHOLD_M = 5000;
const MAX_CANDIDATE_STOPS = 20;
const BEARING_TOLERANCE_DEG = 110;
const WALK_PENALTY_THRESHOLD_M = 800;
const BOARD_BUFFER_SEC = 45;
const AVG_BUS_SPEED_MPS = 8.3;

const SCORE_WEIGHTS = {
  travelTime: 1.0,
  walkPenalty: 1.8,
  transferCost: 300,
  reliability: 0.5,
} as const;

const CONGESTION_WINDOWS = [
  { start: 7, end: 9, factor: 1.4 },
  { start: 17, end: 19, factor: 1.35 },
  { start: 22, end: 5, factor: 0.9 },
] as const;

interface LatLng {
  lat: number;
  lng: number;
}

interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  [key: string]: any;
}

interface LiveBus {
  id: string;
  routeId: string;
  direction: 'forward' | 'return';
  lat: number;
  lng: number;
  speed: number;
  lastUpdate?: number;
  lastGpsUpdate?: string | number | Date;
  [key: string]: any;
}

type TripInput =
  | { type: 'MY_LOCATION' }
  | { type: 'STOP'; stopId: string }
  | { type: 'ADDRESS'; value: string }
  | { type: 'MAP_PICK'; coords: LatLng; displayName?: string };

interface ResolvedInput {
  coords: LatLng;
  displayName: string;
  type: TripInput['type'];
  stopId?: string;
}

type CoordCache = Record<string, LatLng>;

function bearingDeg(from: LatLng, to: LatLng): number {
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function angleDiff(a: number, b: number): number {
  return Math.abs(((a - b + 180 + 360) % 360) - 180);
}

function getCongestionFactor(hour: number): number {
  for (const w of CONGESTION_WINDOWS) {
    const wraps = w.start > w.end;
    const inWindow = wraps
      ? hour >= w.start || hour <= w.end
      : hour >= w.start && hour <= w.end;
    if (inWindow) return w.factor;
  }
  return 1.0;
}

async function resolveInputToCoords(
  input: TripInput,
  cache: CoordCache,
  userLocation: LatLng | null,
): Promise<ResolvedInput | null> {
  switch (input.type) {
    case 'MY_LOCATION': {
      if (!userLocation) return null;
      return { coords: userLocation, displayName: 'Vendndodhja ime', type: 'MY_LOCATION' };
    }
    case 'STOP': {
      const stop = BUS_STOPS.find(s => s.id === input.stopId);
      if (!stop) return null;
      return { coords: { lat: stop.lat, lng: stop.lng }, displayName: stop.name, type: 'STOP', stopId: stop.id };
    }
    case 'ADDRESS': {
      const cached = cache[input.value];
      if (cached) return { coords: cached, displayName: input.value, type: 'ADDRESS' };
      const coords = await geocodeAddress(input.value);
      if (!coords) return null;
      cache[input.value] = coords;
      return { coords, displayName: input.value, type: 'ADDRESS' };
    }
    case 'MAP_PICK': {
      return {
        coords: input.coords,
        displayName: input.displayName ?? `${input.coords.lat.toFixed(4)}, ${input.coords.lng.toFixed(4)}`,
        type: 'MAP_PICK',
      };
    }
  }
}

// FIX 3: filtri i këndit aplikohet vetëm për origjinën — destinacioni merr të gjitha
// stacionet afër, pa filtër drejtimi. Kjo rregullon rastet ku destinacioni është
// "prapa" ose anash origjinës relative ndaj stacioneve.
function getCandidateStops(
  coords: LatLng,
  destination: LatLng,
  tripDistanceM: number,
  isOrigin: boolean,
): { stop: any; walkDist: number }[] {
  const radius = tripDistanceM > LONG_TRIP_THRESHOLD_M ? MAX_WALK_METERS_LONG : MAX_WALK_METERS_BASE;
  const allNearby = getNearestStops(coords.lat, coords.lng, radius, MAX_CANDIDATE_STOPS * 2);

  // Removim i plotë i filtrit të këndit (bearing) edhe për origjinën. Përndryshe, në zona me pak stacione
  // (si Selita ose Kodra e Diellit), stacioni i vetëm afërt mund të filtrohej nëse ishte "mbrapa" ose anash
  // origjinës relative ndaj destinacionit, duke mos lejuar asnjë planifikim rruge.
  return allNearby
    .reduce<{ stop: any; walkDist: number }[]>((acc, item) => {
      const tooClose = acc.some(s => haversineMeters(s.stop.lat, s.stop.lng, item.stop.lat, item.stop.lng) < 50);
      return tooClose ? acc : [...acc, item];
    }, [])
    .slice(0, MAX_CANDIDATE_STOPS);
}


function scoreRoute(opt: TripOption, liveBuses: LiveBus[]): number {
  const walkSec = (opt.walkDistMeters ?? 0) / 1.39;
  const walkPenaltySec = opt.walkDistMeters > WALK_PENALTY_THRESHOLD_M
    ? walkSec * (SCORE_WEIGHTS.walkPenalty - 1) : 0;

  const reliabilityPenalty = opt.legs
    .filter(l => !l.isWalking)
    .reduce((sum, leg) => {
      const bus = liveBuses.find(b => b.routeId === leg.route?.id);
      const gpsTime = bus ? (bus.lastUpdate || (bus.lastGpsUpdate ? new Date(bus.lastGpsUpdate).getTime() : Date.now())) : Date.now();
      const gpsAgeSec = bus
        ? (Date.now() - gpsTime) / 1000
        : 120;
      return sum + (gpsAgeSec > 120 ? SCORE_WEIGHTS.reliability * 60 : 0);
    }, 0);

  return opt.totalTimeSec
    + walkPenaltySec
    + (opt.transfers ?? 0) * SCORE_WEIGHTS.transferCost
    + reliabilityPenalty;
}

function canCatchBus(params: {
  walkDistanceM: number;
  busGpsLat: number;
  busGpsLng: number;
  stopLat: number;
  stopLng: number;
}): { catchable: boolean; marginSeconds: number } {
  const congestion = getCongestionFactor(new Date().getHours());
  const walkSec = (params.walkDistanceM / 1.39) * congestion;
  const realBusEta = haversineMeters(params.busGpsLat, params.busGpsLng, params.stopLat, params.stopLng) / AVG_BUS_SPEED_MPS;
  const margin = realBusEta - walkSec - BOARD_BUFFER_SEC;
  return { catchable: margin >= 0, marginSeconds: Math.round(margin) };
}

// FIX 4: nuk fshihet opsioni nëse autobusi nuk gjendet ose GPS është i papërsosur.
// Vetëm nëse autobusi ka kaluar qartë (margin < -60s) refuzohet opsioni.
function applyLiveCorrections(
  options: TripOption[],
  liveBuses: LiveBus[],
  originCoords: LatLng,
): TripOption[] {
  return options
    .map(opt => {
      const firstTransit = opt.legs.find(l => !l.isWalking);
      if (!firstTransit) return opt;

      const boardStop = BUS_STOPS.find(s => s.name?.toLowerCase().trim() === firstTransit.boardAt?.toLowerCase().trim());
      const bus = liveBuses.find(b => b.routeId === firstTransit.route?.id);

      // FIX 4: nëse nuk kemi live bus data, lejo opsionin të kalojë pa filtrim
      if (!boardStop || !bus || !bus.lat || !bus.lng) return opt;

      const walkDist = haversineMeters(originCoords.lat, originCoords.lng, boardStop.lat, boardStop.lng);
      const { catchable, marginSeconds } = canCatchBus({
        walkDistanceM: walkDist,
        busGpsLat: bus.lat,
        busGpsLng: bus.lng,
        stopLat: boardStop.lat,
        stopLng: boardStop.lng,
      });

      // FIX 4: refuzo vetëm nëse autobusi ka kaluar qartë (> 60s vonesë)
      if (!catchable && marginSeconds < -60) {
        return { ...opt, catchable: false } as any;
      }

      return {
        ...opt,
        catchable: true,
        marginSeconds,
        warning: catchable && marginSeconds < 90 ? `Vetëm ${marginSeconds}s kohë rezervë — nxito!` : undefined,
      } as any;
    })
    .filter(opt => (opt as any).catchable !== false);
}

function deduplicateOptions(options: TripOption[]): TripOption[] {
  const seen = new Set<string>();
  return options.filter(opt => {
    const key = opt.legs.filter(l => !l.isWalking).map(l => l.route?.id).join('→')
      + '|' + Math.floor(opt.totalTimeSec / 180);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function enrichTripLegs(
  opt: TripOption,
  origin: ResolvedInput,
  destination: ResolvedInput,
  index: number
): TripOption {
  const legs = [...opt.legs];
  const fromName = origin.displayName;
  const toName = destination.displayName;

  if (legs[0]?.isWalking && legs[0].boardAt === 'origin') {
    legs[0] = { ...legs[0], boardAt: fromName };
  } else if (legs[0] && !legs[0].isWalking) {
    const boardStopName = legs[0].boardAt!;
    const boardStop = BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === boardStopName?.toLowerCase().trim());
    if (boardStop) {
      const walkDist = Math.round(haversineMeters(origin.coords.lat, origin.coords.lng, boardStop.lat, boardStop.lng));
      if (walkDist > WALK_DISTANCE_THRESHOLD) {
        legs.unshift({
          isWalking: true,
          boardAt: fromName,
          alightAt: boardStopName,
          alightNodeId: boardStop.id,
          walkingDist: walkDist,
          walkingTime: Math.ceil(walkTimeSec(walkDist) / 60),
          walkingTimeSec: walkTimeSec(walkDist),
        });
      }
    }
  }

  const lastLeg = legs[legs.length - 1];
  if (lastLeg?.isWalking && lastLeg.alightAt === 'destination') {
    legs[legs.length - 1] = { ...lastLeg, alightAt: toName };
  } else if (lastLeg && !lastLeg.isWalking) {
    const alightStopName = lastLeg.alightAt!;
    const alightStop = BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === alightStopName?.toLowerCase().trim());
    if (alightStop) {
      const walkDist = Math.round(haversineMeters(destination.coords.lat, destination.coords.lng, alightStop.lat, alightStop.lng));
      if (walkDist > WALK_DISTANCE_THRESHOLD) {
        legs.push({
          isWalking: true,
          boardAt: alightStopName,
          alightAt: toName,
          boardNodeId: alightStop.id,
          walkingDist: walkDist,
          walkingTime: Math.ceil(walkTimeSec(walkDist) / 60),
          walkingTimeSec: walkTimeSec(walkDist),
        });
      }
    }
  }

  // Merge consecutive walking legs
  const mergedLegs: TripLeg[] = [];
  for (const leg of legs) {
    if (mergedLegs.length > 0 && mergedLegs[mergedLegs.length - 1].isWalking && leg.isWalking) {
      const prev = mergedLegs[mergedLegs.length - 1];
      prev.alightAt = leg.alightAt;
      prev.alightNodeId = leg.alightNodeId;
      prev.walkingDist = (prev.walkingDist || 0) + (leg.walkingDist || 0);
      prev.walkingTimeSec = (prev.walkingTimeSec || 0) + (leg.walkingTimeSec || 0);
      prev.walkingTime = Math.ceil(prev.walkingTimeSec / 60);
      if (prev.waypoints && leg.waypoints) {
        prev.waypoints = [...prev.waypoints, ...leg.waypoints];
      } else {
        prev.waypoints = undefined;
      }
    } else {
      mergedLegs.push(leg);
    }
  }

  return {
    ...opt,
    legs: mergedLegs,
    from: fromName,
    to: toName,
    optionIndex: index + 1,
    travelTime: opt.travelTime ?? Math.round(opt.totalTimeSec / 60),
    totalPrice: opt.totalPrice ?? (mergedLegs.filter(l => !l.isWalking).length * 40)
  };
}

// ─── STORE ────────────────────────────────────────────────────────────────────
const useStore = create<any>()(
  persist(
    (set, get) => ({
      // ── Auth ──
      user: null,
      staffUser: null,
      isAuthenticated: false,
      token: null,
      guestMode: true,
      setGuestMode: (val: boolean) => set({ guestMode: val }),
      login: (userData: any, token: any) => set({ user: userData, isAuthenticated: true, token, guestMode: false }),
      loginAsStaff: (staffData: any) => set({ staffUser: staffData, isAuthenticated: true, user: null, guestMode: false, currentView: 'staff_dashboard' }),
      logout: () => set({ user: null, staffUser: null, isAuthenticated: false, token: null, guestMode: true, currentView: 'map' }),

      // ── Cover Slideshow ──
      currentCoverIndex: 0,
      nextCoverIndex: () => set((state: any) => ({ currentCoverIndex: (state.currentCoverIndex + 1) % 10 })),

      updateProfile: async (data: any, skipApiCall = false) => {
        const currentUser = get().user;
        if (!currentUser) return;
        set((state: any) => ({ user: { ...state.user, ...data } }));
        if (!skipApiCall && (currentUser.id || currentUser._id)) {
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

          if (Capacitor.isNativePlatform()) {
            try {
              let permStatus = await PushNotifications.checkPermissions();
              if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
              }
              if (permStatus.receive === 'granted') {
                await PushNotifications.register();

                await PushNotifications.addListener('registration', (token) => {
                  console.log('FCM Device Token:', token.value);
                  // Këtu mund të bëni një thirrje API për të ruajtur token te përdoruesi në DB
                });

                await PushNotifications.addListener('registrationError', (err) => {
                  console.error('Push registration error:', err);
                });

                await PushNotifications.addListener('pushNotificationReceived', (notification) => {
                  console.log('Push received:', notification);
                });

                await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                  console.log('Push action performed:', action);
                });
              }
            } catch (pushErr) {
              console.warn('Push Notifications setup failed:', pushErr);
            }
          }
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
      busesLoading: true,
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
          if (Array.isArray(buses) && buses.length > 0) {
            const normalized = buses.map((bus: any) => ({
              ...bus,
              routeId: bus.routeId && !bus.routeId.startsWith('L') ? `L${bus.routeId}` : bus.routeId
            }));
            set({ buses: normalized, busesLoading: false });
            return;
          }
        } catch (error) {
          console.warn('API fetch failed, using client-side simulation:', error);
        }
        // Fallback: generate simulated buses from BUS_ROUTES if no buses exist yet
        const currentBuses = get().buses;
        if (!Array.isArray(currentBuses) || currentBuses.length === 0) {
          const simulated: any[] = [];
          BUS_ROUTES.forEach((route: any) => {
            const shape0 = BUS_SHAPES[`${route.id}_0` as keyof typeof BUS_SHAPES] as [number, number][] || [];
            const shape1 = BUS_SHAPES[`${route.id}_1` as keyof typeof BUS_SHAPES] as [number, number][] || [];
            const mainShape = BUS_SHAPES[route.id as keyof typeof BUS_SHAPES] as [number, number][] || [];
            const fwShape = shape0.length > 0 ? shape0 : mainShape;
            const rvShape = shape1.length > 0 ? shape1 : (mainShape.length > 0 ? [...mainShape].reverse() : []);

            // Create 1-2 buses per route
            const busCount = Math.random() > 0.5 ? 2 : 1;
            for (let b = 0; b < busCount; b++) {
              const isReturn = b === 1;
              const shape = isReturn ? rvShape : fwShape;
              if (shape.length < 2) continue;
              const startIdx = Math.floor(Math.random() * (shape.length * 0.8));
              simulated.push({
                id: `sim_${route.id}_${b}`,
                routeId: route.id,
                routeName: route.label || route.name,
                routeColor: route.color,
                direction: isReturn ? 'return' : 'forward',
                lat: shape[startIdx]?.[0] ?? shape[0][0],
                lng: shape[startIdx]?.[1] ?? shape[0][1],
                currentPointIdx: startIdx,
                status: 'moving',
                speed: 30 + Math.random() * 15,
                passengerLoad: Math.floor(Math.random() * 30) + 5,
                waitingTicks: 0,
                ticks: 0,
                delay: 0,
                nextStop: '',
                currentStop: '',
                lastUpdate: Date.now(),
              });
            }
          });
          set({ buses: simulated, busesLoading: false });
        } else {
          set({ busesLoading: false });
        }
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
      trackingIntervalId: null as any,
      trackingRefCount: 0,
      startTracking: async () => {
        const currentCount = get().trackingRefCount || 0;
        set({ trackingRefCount: currentCount + 1 });
        if (currentCount > 0) {
          return;
        }

        if (get().geolocationPermissionDenied || get().watchId) return;
        const onPosition = (lat: number, lng: number) => set({ userLocation: { lat, lng } });
        const onError = (err: any) => {
          const msg = String(err?.message || err?.code || '').toLowerCase();
          if (msg.includes('permission') || err?.code === 1) { set({ geolocationPermissionDenied: true }); return; }
        };

        // 1. Watch position stream with zero cached location age
        if (Capacitor.isNativePlatform()) {
          try {
            const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {
              if (err) return onError(err);
              if (pos?.coords) onPosition(pos.coords.latitude, pos.coords.longitude);
            });
            set({ watchId: id });
          } catch { }
        } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
          const id = navigator.geolocation.watchPosition(
            (pos) => onPosition(pos.coords.latitude, pos.coords.longitude),
            onError,
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
          set({ watchId: id });
        }

        // 2. Active polling interval to force GPS retrieval every 5 seconds when in motion
        const intervalId = setInterval(async () => {
          try {
            const pos = await get().getCurrentPosition({ enableHighAccuracy: true, timeout: 4000, maximumAge: 0 });
            if (pos?.coords) {
              onPosition(pos.coords.latitude, pos.coords.longitude);
            }
          } catch (e) {
            // Ignore temporary position fetch timeout or errors in background tracking
          }
        }, 5000);

        set({ trackingIntervalId: intervalId });
      },
      stopTracking: async () => {
        const currentCount = get().trackingRefCount || 0;
        const nextCount = Math.max(0, currentCount - 1);
        set({ trackingRefCount: nextCount });
        if (nextCount > 0) {
          return;
        }

        const { watchId, trackingIntervalId } = get();
        if (trackingIntervalId) {
          clearInterval(trackingIntervalId);
          set({ trackingIntervalId: null });
        }
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
      showTripDetails: false,
      setShowTripDetails: (show: boolean) => set({ showTripDetails: show }),

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
          if (bus.isRealGPS) return bus;
          if (bus.waitingTicks > 0) return { ...bus, waitingTicks: bus.waitingTicks - 1, status: 'stopped' };

          const ticks = (bus.ticks || 0) + 1;
          const route = BUS_ROUTES.find((r: any) => r.id === bus.routeId);
          if (!route) return bus;

          const isReturn = bus.direction === 'return';
          const sIds = isReturn ? (route.returnStops || [...route.stops].reverse()) : route.stops;

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

      // ── Trip Planner ──────────────────────────────────────────────────────
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

      planTrip: async (from: TripInput | string, to: TripInput | string) => {
        console.log('🔍 planTrip started:', { from, to });
        const state = get();

        const normalizeInput = (input: TripInput | string): TripInput => {
          if (typeof input === 'string') {
            const isMyLocation = ['vendndodhja', 'my location', 'location'].some(k => input.toLowerCase().includes(k));
            if (isMyLocation) return { type: 'MY_LOCATION' };
            const stop = BUS_STOPS.find(s => s.name.toLowerCase().trim() === input.toLowerCase().trim());
            if (stop) return { type: 'STOP', stopId: stop.id };
            return { type: 'ADDRESS', value: input };
          }
          return input;
        };

        const normFrom = normalizeInput(from);
        const normTo = normalizeInput(to);

        const [origin, destination] = await Promise.all([
          resolveInputToCoords(normFrom, state.coordCache ?? {}, state.userLocation),
          resolveInputToCoords(normTo, state.coordCache ?? {}, state.userLocation),
        ]);

        if (!origin) return set({ tripResult: { error: 'Adresa e nisjes nuk u gjet.' }, activeTrip: null });
        if (!destination) return set({ tripResult: { error: 'Adresa e destinacionit nuk u gjet.' }, activeTrip: null });

        const directDistM = haversineMeters(origin.coords.lat, origin.coords.lng, destination.coords.lat, destination.coords.lng);

        let fromStops = getCandidateStops(origin.coords, destination.coords, directDistM, true);
        let toStops = getCandidateStops(destination.coords, origin.coords, directDistM, false);

        if (normFrom.type === 'STOP') {
          const matched = BUS_STOPS.find(s => s.id === normFrom.stopId);
          if (matched && !fromStops.some(item => item.stop.id === matched.id)) {
            fromStops.unshift({ stop: matched, walkDist: 0 });
          }
        }
        if (normTo.type === 'STOP') {
          const matched = BUS_STOPS.find(s => s.id === normTo.stopId);
          if (matched && !toStops.some(item => item.stop.id === matched.id)) {
            toStops.unshift({ stop: matched, walkDist: 0 });
          }
        }

        if (!fromStops.length || !toStops.length) {
          return set({ tripResult: { error: 'Nuk u gjetën stacione afër vendndodhjes suaj.' }, activeTrip: null });
        }

        // Fetch actual walking distances via OSRM Table API
        if (fromStops.length > 0) {
          const fromCoords = [origin.coords, ...fromStops.map(x => x.stop)];
          const coordsStr = fromCoords.map(c => `${c.lng},${c.lat}`).join(';');
          try {
            const res = await fetch(`https://router.project-osrm.org/table/v1/foot/${coordsStr}?sources=0&annotations=distance`);
            const data = await res.json();
            if (data.code === 'Ok' && data.distances && data.distances[0]) {
              fromStops = fromStops.map((item, idx) => {
                const trueDist = data.distances[0][idx + 1];
                return {
                  ...item,
                  walkDist: typeof trueDist === 'number' ? Math.round(trueDist) : item.walkDist,
                };
              });
            }
          } catch (err) {
            console.warn('OSRM fromStops table routing failed, falling back to Haversine:', err);
          }
        }

        if (toStops.length > 0) {
          const toCoords = [destination.coords, ...toStops.map(x => x.stop)];
          const coordsStr = toCoords.map(c => `${c.lng},${c.lat}`).join(';');
          try {
            const res = await fetch(`https://router.project-osrm.org/table/v1/foot/${coordsStr}?sources=0&annotations=distance`);
            const data = await res.json();
            if (data.code === 'Ok' && data.distances && data.distances[0]) {
              toStops = toStops.map((item, idx) => {
                const trueDist = data.distances[0][idx + 1];
                return {
                  ...item,
                  walkDist: typeof trueDist === 'number' ? Math.round(trueDist) : item.walkDist,
                };
              });
            }
          } catch (err) {
            console.warn('OSRM toStops table routing failed, falling back to Haversine:', err);
          }
        }

        const liveBuses = state.buses ?? [];
        const departureMode = state.tripDepartureMode;
        const isArriveBy = departureMode === 'arrive_by';
        const desiredTime = (departureMode !== 'now' && state.tripDepartureTime)
          ? new Date(state.tripDepartureTime) : new Date();
        const depTimeSec = Math.floor(desiredTime.getTime() / 1000);

        const rawOptions = runRaptorRouter(fromStops, toStops, depTimeSec, isArriveBy, liveBuses);

        if (!rawOptions.length) {
          return set({ tripResult: { error: 'Nuk u gjet asnjë rrugë. Provo destinacion tjetër.' }, tripOptions: [], activeTrip: null });
        }

        const enriched = deduplicateOptions(
          applyLiveCorrections(
            rawOptions.sort((a, b) => scoreRoute(a, liveBuses) - scoreRoute(b, liveBuses)),
            liveBuses,
            origin.coords,
          )
        ).map((opt, i) => enrichTripLegs(opt, origin, destination, i));

        if (!enriched.length) {
          return set({ tripResult: { error: 'Të gjitha autobuset kanë nisur. Provo orë tjetër.' }, tripOptions: [], activeTrip: null });
        }

        // Asynchronously enrich the top 5 options with precise walking geometries and distances from OSRM
        const engine = new WalkingEngine();
        const finalOptions: TripOption[] = [];

        for (const opt of enriched.slice(0, 5)) {
          let updatedLegs = [...opt.legs];
          let modified = false;

          for (let idx = 0; idx < updatedLegs.length; idx++) {
            const leg = updatedLegs[idx];
            if (leg.isWalking) {
              const bStop = leg.boardNodeId ? BUS_STOPS.find((s: any) => s.id === leg.boardNodeId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.boardAt?.toLowerCase().trim());
              const aStop = leg.alightNodeId ? BUS_STOPS.find((s: any) => s.id === leg.alightNodeId) : BUS_STOPS.find((s: any) => s.name?.toLowerCase().trim() === leg.alightAt?.toLowerCase().trim());

              let startLat = bStop ? bStop.lat : null;
              let startLng = bStop ? bStop.lng : null;
              let destLat = aStop ? aStop.lat : null;
              let destLng = aStop ? aStop.lng : null;

              if (idx === 0) {
                startLat = origin.coords.lat;
                startLng = origin.coords.lng;
              }
              if (idx === opt.legs.length - 1) {
                destLat = destination.coords.lat;
                destLng = destination.coords.lng;
              }

              if (startLat !== null && startLng !== null && destLat !== null && destLng !== null) {
                try {
                  const res = await engine.calculateWalkingRoute(
                    { lat: startLat, lng: startLng },
                    { lat: destLat, lng: destLng }
                  );
                  if (res && res.distanceMeters && res.durationSeconds) {
                    updatedLegs[idx] = {
                      ...leg,
                      walkingDist: res.distanceMeters,
                      walkingTime: Math.ceil(res.durationSeconds / 60),
                      walkingTimeSec: res.durationSeconds,
                      waypoints: res.waypoints,
                    };
                    modified = true;
                  }
                } catch (err) {
                  console.warn(`Error enriching walking leg ${idx}:`, err);
                }
              }
            }
          }

          if (modified) {
            const totalWalkDist = updatedLegs.filter(l => l.isWalking).reduce((s, l) => s + (l.walkingDist || 0), 0);
            const originalTotalWalkSec = opt.legs.filter(l => l.isWalking).reduce((s, l) => s + (l.walkingTimeSec || 0), 0);
            const transitTimeSec = opt.totalTimeSec - originalTotalWalkSec;

            const newTotalWalkSec = updatedLegs.filter(l => l.isWalking).reduce((s, l) => s + (l.walkingTimeSec || 0), 0);
            const newTotalTimeSec = Math.max(1, transitTimeSec + newTotalWalkSec);

            const departure = new Date(opt.departureTime);
            const arrival = new Date(departure.getTime() + newTotalTimeSec * 1000);

            const updatedOpt: TripOption = {
              ...opt,
              legs: updatedLegs,
              totalTimeSec: newTotalTimeSec,
              walkDistMeters: totalWalkDist,
              travelTime: Math.round(newTotalTimeSec / 60),
              arrivalTime: arrival.toISOString(),
            };

            updatedOpt.score = scoreRoute(updatedOpt, liveBuses);
            finalOptions.push(updatedOpt);
          } else {
            finalOptions.push(opt);
          }
        }

        if (enriched.length > 5) {
          finalOptions.push(...enriched.slice(5));
        }

        finalOptions.sort((a, b) => a.score - b.score);

        set({
          tripResult: finalOptions[0],
          tripOptions: finalOptions,
          selectedTripOptionIndex: 0,
          activeTrip: finalOptions[0],
          showRoutes: true,
          showBuses: true,
          coordCache: state.coordCache ?? {},
        });
      },

      isSplashFinished: true,
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

      // ── Recent Route ──
      recentRouteId: null,
      setRecentRouteId: (routeId: string) => set({ recentRouteId: routeId }),

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
          'selectedStop', 'activeRouteFilter', 'currentView', 'isSidebarOpen',
          'currentCoverIndex', 'showTripDetails', 'selectingOnMap',
          'selectedBus', 'selectedRoute', 'watchId', 'guestMode'
        ].includes(key))
      ),
    }
  )
);

export default useStore;