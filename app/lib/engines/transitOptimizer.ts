import { LatLng, WalkingEngine, WalkingRouteResult } from './walkingEngine';

// ── Konstantet ────────────────────────────────────────────────────────────────
const TRANSFER_BUFFER_SECONDS = 60;   // Buffer sigurie për ngjitje
const MISSED_BUS_PENALTY_SECONDS = 900; // 15 min penalti për autobus të humbur

// ── Tipet ─────────────────────────────────────────────────────────────────────
export interface TransitStopCandidate {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface TransitBusCandidate {
  id: string;
  nextStopId: string;
  routeStops: string[];
  etaToStopSeconds: number;
}

export interface StopWalkAnalysis {
  stop: TransitStopCandidate;
  walkInfo: WalkingRouteResult;
  approachingBus: TransitBusCandidate;
  canCatchBus: boolean;
  totalJourneySeconds: number;
  walkingDurationSeconds: number;
}

// ── Optimizer ─────────────────────────────────────────────────────────────────
export class TransitOptimizer {
  static async selectBestBoardingStop(
    passengerGps: LatLng,
    candidateStops: TransitStopCandidate[],
    activeBuses: TransitBusCandidate[],
    walkingEngine: WalkingEngine
  ): Promise<StopWalkAnalysis | null> {
    if (!candidateStops.length || !activeBuses.length) return null;

    // Të gjitha walking routes paralele — jo sekuenciale
    const walkResults = await Promise.allSettled(
      candidateStops.map(stop =>
        walkingEngine.calculateWalkingRoute(passengerGps, stop).then(walkInfo => ({
          stop,
          walkInfo
        }))
      )
    );

    const candidates: StopWalkAnalysis[] = [];

    for (const result of walkResults) {
      if (result.status === 'rejected') {
        console.warn('Walking route calculation failed:', result.reason);
        continue;
      }

      const { stop, walkInfo } = result.value;

      const approachingBus = TransitOptimizer.findNextApproachingBus(stop, activeBuses);
      if (!approachingBus) continue;

      const walkDurationSeconds = walkInfo.durationSeconds;
      const canCatchBus = (walkDurationSeconds + TRANSFER_BUFFER_SECONDS) <= approachingBus.etaToStopSeconds;
      const penalty = canCatchBus ? 0 : MISSED_BUS_PENALTY_SECONDS;

      candidates.push({
        stop,
        walkInfo,
        approachingBus,
        canCatchBus,
        walkingDurationSeconds: walkDurationSeconds,
        totalJourneySeconds: walkDurationSeconds + approachingBus.etaToStopSeconds + penalty,
      });
    }

    if (!candidates.length) return null;

    return candidates.reduce((best, current) =>
      current.totalJourneySeconds < best.totalJourneySeconds ? current : best
    );
  }

  private static findNextApproachingBus(
    stop: TransitStopCandidate,
    activeBuses: TransitBusCandidate[]
  ): TransitBusCandidate | null {
    let earliest: TransitBusCandidate | null = null;

    for (const bus of activeBuses) {
      const servicesStop = bus.nextStopId === stop.id || bus.routeStops.includes(stop.id);
      if (!servicesStop) continue;
      if (!earliest || bus.etaToStopSeconds < earliest.etaToStopSeconds) {
        earliest = bus;
      }
    }

    return earliest;
  }
}