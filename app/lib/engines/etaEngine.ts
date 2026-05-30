import Trip from '../../models/Trip';
import Route from '../../models/Route';

// ── Konstantet ────────────────────────────────────────────────────────────────
const FALLBACK_VELOCITY_MPS = 11.1; // ~40 km/h kur GPS velocity mungon

const TRAFFIC_WINDOWS: Array<{ start: number; end: number; multiplier: number }> = [
  { start: 7, end: 9, multiplier: 1.5 }, // Mëngjes peak
  { start: 17, end: 19, multiplier: 1.4 }, // Pasdite peak
  { start: 22, end: 5, multiplier: 0.9 }, // Natë — rrugë të lira
];

// ── Tipet ─────────────────────────────────────────────────────────────────────
interface EtaResult {
  tripId: string;
  nextStopId: string | null;
  etaSeconds: number;
  expectedArrivalTime: Date;
  distanceToGoMeters: number;
  adjustedVelocityMPS: number;
  trafficMultiplier: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getTrafficMultiplier(hour: number): number {
  for (const window of TRAFFIC_WINDOWS) {
    const wrapsOvernight = window.start > window.end;
    const inWindow = wrapsOvernight
      ? hour >= window.start || hour <= window.end   // p.sh. 22–05
      : hour >= window.start && hour <= window.end;  // p.sh. 07–09

    if (inWindow) return window.multiplier;
  }
  return 1.0; // Normal traffic
}

function calcDistanceToGo(stops: any[], fromIndex: number): number {
  let total = 0;
  for (let i = fromIndex + 1; i < stops.length; i++) {
    const d = stops[i].distanceFromPreviousMeters;
    if (typeof d === 'number' && d > 0) total += d;
  }
  return total;
}

// ── ETA Engine ────────────────────────────────────────────────────────────────
export async function calculateDynamicEta(
  tripId: string,
  currentGpsSequenceIndex?: number
): Promise<EtaResult | null> {
  const [trip,] = await Promise.all([Trip.findById(tripId)]);
  if (!trip || trip.status !== 'EN_ROUTE') return null;

  const route = await Route.findById(trip.routeId);
  if (!route?.orderedStops?.length) return null;

  const stops = route.orderedStops;
  const currentIndex = currentGpsSequenceIndex ?? trip.currentGpsSequenceIndex ?? 0;

  // Trip është në stacionin e fundit
  if (currentIndex >= stops.length - 1) {
    return {
      tripId,
      nextStopId: null,
      etaSeconds: 0,
      expectedArrivalTime: new Date(),
      distanceToGoMeters: 0,
      adjustedVelocityMPS: 0,
      trafficMultiplier: 1.0,
    };
  }

  const distanceToGoMeters = calcDistanceToGo(stops, currentIndex);
  if (distanceToGoMeters === 0) return null; // Data e gabuar në route

  // Velocity: nga GPS telemetri i trip-it, ose fallback
  const baseVelocityMPS = trip.currentSpeedMPS ?? FALLBACK_VELOCITY_MPS;
  const trafficMultiplier = getTrafficMultiplier(new Date().getHours());
  const adjustedVelocity = baseVelocityMPS / trafficMultiplier;

  const etaSeconds = Math.round(distanceToGoMeters / adjustedVelocity);

  const expectedArrivalTime = new Date(Date.now() + etaSeconds * 1000);

  return {
    tripId,
    nextStopId: stops[currentIndex + 1].stopId,
    etaSeconds,
    expectedArrivalTime,
    distanceToGoMeters: Math.round(distanceToGoMeters),
    adjustedVelocityMPS: parseFloat(adjustedVelocity.toFixed(2)),
    trafficMultiplier,
  };
}