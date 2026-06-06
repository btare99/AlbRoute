'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Route, RouteStep, fetchReroute, formatDistance, formatETA } from '../services/routeService';
import { speak, stopSpeaking, resetDebounce } from '../services/voiceService';

/** Lazy-load Capacitor modules (avoids SSR crash) */
async function getCapacitor() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor;
  } catch { return null; }
}
async function getGeolocation() {
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    return Geolocation;
  } catch { return null; }
}
async function getKeepAwake() {
  try {
    const Cap = await getCapacitor();
    if (!Cap?.isNativePlatform()) return null;
    const { KeepAwake } = await import('@capacitor-community/keep-awake');
    return KeepAwake;
  } catch { return null; }
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface NavigationState {
  currentStep: RouteStep | null;
  currentStepIndex: number;
  distanceToNextTurn: number;
  distanceToNextTurnFormatted: string;
  eta: string;
  remainingDuration: number; // seconds
  remainingDistance: number; // meters
  userPosition: { lat: number; lng: number } | null;
  userBearing: number;
  isNavigating: boolean;
  hasArrived: boolean;
  isRerouting: boolean;
}

interface UseNavigationOptions {
  selectedRoute: Route | null;
  destination: [number, number] | null; // [lng, lat]
  destinationName: string;
  isMuted: boolean;
  language: string;
  onDeviation?: () => void;
  onArrival?: () => void;
  onReroute?: (newRoute: Route) => void;
}

// ─── Geometry Helpers ────────────────────────────────────────────────────────

/** Haversine distance in meters */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bearing from point A to point B (degrees, 0=N) */
function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const la1 = lat1 * Math.PI / 180;
  const la2 = lat2 * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

/** Min distance from a point to a polyline (meters) */
function distanceToPolyline(lat: number, lng: number, coords: [number, number][]): number {
  if (coords.length < 2) return Infinity;
  let minDist = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const [aLat, aLng] = coords[i];
    const [bLat, bLng] = coords[i + 1];
    const d = pointToSegmentDistance(lat, lng, aLat, aLng, bLat, bLng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function pointToSegmentDistance(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number
): number {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = 0;
  if (len2 > 0) {
    t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  }
  const cx = ax + t * dx, cy = ay + t * dy;
  return haversine(px, py, cx, cy);
}

// ─── Constants ───────────────────────────────────────────────────────────────
const STEP_ARRIVAL_THRESHOLD = 30; // meters to consider step reached
const DEVIATION_THRESHOLD = 50;     // meters to trigger reroute
const ANNOUNCE_DISTANCES = [200, 50]; // meters at which to announce
const ARRIVAL_THRESHOLD = 30;       // meters to consider destination reached

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNavigation(options: UseNavigationOptions): NavigationState & {
  startNavigation: () => void;
  stopNavigation: () => void;
} {
  const {
    selectedRoute,
    destination,
    destinationName,
    isMuted,
    language,
    onDeviation,
    onArrival,
    onReroute,
  } = options;

  const [isNavigating, setIsNavigating] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [isRerouting, setIsRerouting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [userBearing, setUserBearing] = useState(0);
  const [distanceToNextTurn, setDistanceToNextTurn] = useState(0);
  const [remainingDuration, setRemainingDuration] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);

  const watchIdRef = useRef<string | null>(null);
  const activeRouteRef = useRef<Route | null>(null);
  const announcedStepsRef = useRef<Set<string>>(new Set());
  const lastBearingRef = useRef(0);

  // Track the active route
  useEffect(() => {
    activeRouteRef.current = selectedRoute;
  }, [selectedRoute]);

  // ── Announce instruction ──
  const announce = useCallback(async (text: string) => {
    if (isMuted || !text) return;
    await speak(text, language === 'al' ? 'sq-AL' : language === 'it' ? 'it-IT' : 'en-US');
  }, [isMuted, language]);

  // ── GPS Position Handler ──
  const handlePosition = useCallback((lat: number, lng: number) => {
    const route = activeRouteRef.current;
    if (!route || !route.steps || route.steps.length === 0) return;

    setUserPosition({ lat, lng });

    // Compute bearing to next step maneuver
    const currentStep = route.steps[currentStepIndex];
    if (currentStep) {
      const stepLoc = currentStep.maneuver.location; // [lng, lat]
      const b = bearing(lat, lng, stepLoc[1], stepLoc[0]);
      setUserBearing(b);
      lastBearingRef.current = b;

      // Distance to current step
      const dist = haversine(lat, lng, stepLoc[1], stepLoc[0]);
      setDistanceToNextTurn(dist);

      // Announce at distance thresholds
      for (const threshold of ANNOUNCE_DISTANCES) {
        const key = `${currentStepIndex}_${threshold}`;
        if (dist <= threshold && !announcedStepsRef.current.has(key)) {
          announcedStepsRef.current.add(key);
          announce(currentStep.instruction);
        }
      }

      // Check if we've reached the current step
      if (dist <= STEP_ARRIVAL_THRESHOLD) {
        const nextIdx = currentStepIndex + 1;
        if (nextIdx < route.steps.length) {
          setCurrentStepIndex(nextIdx);
          // Announce next step
          const nextStep = route.steps[nextIdx];
          if (nextStep) {
            announce(nextStep.instruction);
          }
        }
      }
    }

    // Compute remaining distance and duration
    let remDist = 0;
    let remDur = 0;
    for (let i = currentStepIndex; i < route.steps.length; i++) {
      remDist += route.steps[i].distance;
      remDur += route.steps[i].duration;
    }
    // Subtract what we've already covered in the current step
    if (currentStep) {
      const stepDist = haversine(lat, lng, currentStep.maneuver.location[1], currentStep.maneuver.location[0]);
      // rough approximation
      remDist = Math.max(0, remDist - (currentStep.distance - stepDist));
    }
    setRemainingDistance(remDist);
    setRemainingDuration(remDur);

    // Check if arrived at destination
    if (destination) {
      const destDist = haversine(lat, lng, destination[1], destination[0]);
      if (destDist <= ARRIVAL_THRESHOLD) {
        setHasArrived(true);
        announce(language === 'al'
          ? `Keni mbërritur në ${destinationName}`
          : `You have arrived at ${destinationName}`);
        onArrival?.();
        return;
      }
    }

    // Check deviation from route
    const routeCoords = route.coordinates; // [lat, lng][]
    const distToRoute = distanceToPolyline(lat, lng, routeCoords);
    if (distToRoute > DEVIATION_THRESHOLD && !isRerouting) {
      console.log(`[Navigation] Deviation detected: ${distToRoute.toFixed(0)}m from route`);
      onDeviation?.();
      handleReroute(lng, lat);
    }
  }, [currentStepIndex, destination, destinationName, isRerouting, announce, language, onArrival, onDeviation]);

  // ── Reroute handler ──
  const handleReroute = useCallback(async (lng: number, lat: number) => {
    if (!destination || isRerouting) return;
    setIsRerouting(true);

    announce(language === 'al' ? 'Duke rillogaritur rrugën...' : 'Rerouting...');

    try {
      const newRoute = await fetchReroute([lng, lat], destination);
      if (newRoute) {
        activeRouteRef.current = newRoute;
        setCurrentStepIndex(0);
        announcedStepsRef.current.clear();
        onReroute?.(newRoute);

        // Announce first step of new route
        if (newRoute.steps.length > 0) {
          announce(newRoute.steps[0].instruction);
        }
      }
    } catch (err) {
      console.error('[Navigation] Reroute failed:', err);
    } finally {
      setIsRerouting(false);
    }
  }, [destination, isRerouting, announce, language, onReroute]);

  // ── Start Navigation ──
  const startNavigation = useCallback(async () => {
    if (!selectedRoute) return;

    setIsNavigating(true);
    setHasArrived(false);
    setCurrentStepIndex(0);
    announcedStepsRef.current.clear();
    resetDebounce();

    // Keep screen awake
    try {
      const KA = await getKeepAwake();
      if (KA) await KA.keepAwake();
    } catch (err) {
      console.warn('[Navigation] KeepAwake not available:', err);
    }

    // Start GPS watch
    try {
      const Cap = await getCapacitor();
      if (Cap?.isNativePlatform()) {
        const Geo = await getGeolocation();
        if (Geo) {
          const id = await Geo.watchPosition(
            { enableHighAccuracy: true },
            (pos, err) => {
              if (err) {
                console.error('[Navigation] GPS error:', err);
                return;
              }
              if (pos?.coords) {
                handlePosition(pos.coords.latitude, pos.coords.longitude);
              }
            }
          );
          watchIdRef.current = id;
        }
      } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            handlePosition(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => console.error('[Navigation] GPS error:', err),
          { enableHighAccuracy: true, timeout: 60000, maximumAge: 0 }
        );
        watchIdRef.current = String(id);
      }
    } catch (err) {
      console.error('[Navigation] Failed to start GPS watch:', err);
    }

    // Announce first step
    if (selectedRoute.steps.length > 0) {
      announce(selectedRoute.steps[0].instruction);
    }
  }, [selectedRoute, handlePosition, announce]);

  // ── Stop Navigation ──
  const stopNavigation = useCallback(async () => {
    setIsNavigating(false);
    setHasArrived(false);
    setCurrentStepIndex(0);
    setUserPosition(null);
    setDistanceToNextTurn(0);
    setRemainingDistance(0);
    setRemainingDuration(0);
    announcedStepsRef.current.clear();

    // Stop GPS watch
    if (watchIdRef.current) {
      try {
        const Cap = await getCapacitor();
        if (Cap?.isNativePlatform()) {
          const Geo = await getGeolocation();
          if (Geo) await Geo.clearWatch({ id: watchIdRef.current });
        } else if (typeof navigator !== 'undefined') {
          navigator.geolocation.clearWatch(Number(watchIdRef.current));
        }
      } catch (err) {
        console.warn('[Navigation] Clear watch error:', err);
      }
      watchIdRef.current = null;
    }

    // Allow screen sleep
    try {
      const KA = await getKeepAwake();
      if (KA) await KA.allowSleep();
    } catch (err) {
      console.warn('[Navigation] AllowSleep not available:', err);
    }

    // Stop TTS
    await stopSpeaking();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (watchIdRef.current) {
          try {
            const Cap = await getCapacitor();
            if (Cap?.isNativePlatform()) {
              const Geo = await getGeolocation();
              if (Geo) await Geo.clearWatch({ id: watchIdRef.current });
            } else if (typeof navigator !== 'undefined') {
              navigator.geolocation.clearWatch(Number(watchIdRef.current));
            }
          } catch { }
        }
        try {
          const KA = await getKeepAwake();
          if (KA) await KA.allowSleep();
        } catch { }
        await stopSpeaking().catch(() => { });
      };
      cleanup();
    };
  }, []);

  // Auto-stop on arrival
  useEffect(() => {
    if (hasArrived && isNavigating) {
      // Don't immediately stop — let the arrival UI show
      const timer = setTimeout(() => {
        stopNavigation();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasArrived, isNavigating, stopNavigation]);

  const currentStep = selectedRoute?.steps?.[currentStepIndex] || null;

  return {
    currentStep,
    currentStepIndex,
    distanceToNextTurn,
    distanceToNextTurnFormatted: formatDistance(distanceToNextTurn),
    eta: formatETA(remainingDuration),
    remainingDuration,
    remainingDistance,
    userPosition,
    userBearing,
    isNavigating,
    hasArrived,
    isRerouting,
    startNavigation,
    stopNavigation,
  };
}
