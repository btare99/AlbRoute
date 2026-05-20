import { LatLng, WalkingEngine, WalkingRouteResult } from './walkingEngine';

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

export class TransitOptimizer {
  static async selectBestBoardingStop(
    passengerGps: LatLng,
    candidateStops: TransitStopCandidate[],
    activeBuses: TransitBusCandidate[],
    walkingEngine: WalkingEngine
  ): Promise<StopWalkAnalysis | null> {
    const candidatesAnalysis: StopWalkAnalysis[] = [];

    for (const stop of candidateStops) {
      try {
        // 1. Calculate actual walkable path
        const walkInfo = await walkingEngine.calculateWalkingRoute(passengerGps, stop);
        
        // 2. Find approaching bus
        const approachingBus = this.findNextApproachingBus(stop, activeBuses);
        if (!approachingBus) continue;

        const busArrivalSeconds = approachingBus.etaToStopSeconds;
        const walkDurationSeconds = walkInfo.durationSeconds;
        const transferBufferSeconds = 60; // 1-minute safety padding
        
        const canCatchBus = (walkDurationSeconds + transferBufferSeconds) <= busArrivalSeconds;

        // Optimized total journey index (includes missed bus penalty)
        const totalJourneySeconds = walkDurationSeconds + (canCatchBus ? busArrivalSeconds : (busArrivalSeconds + 900));

        candidatesAnalysis.push({
          stop,
          walkInfo,
          approachingBus,
          canCatchBus,
          totalJourneySeconds,
          walkingDurationSeconds: walkDurationSeconds
        });
      } catch (err) {
        console.warn(`Stop optimization skipped for stop ${stop.id}:`, err);
      }
    }

    if (!candidatesAnalysis.length) return null;

    candidatesAnalysis.sort((a, b) => a.totalJourneySeconds - b.totalJourneySeconds);
    return candidatesAnalysis[0];
  }

  private static findNextApproachingBus(
    stop: TransitStopCandidate,
    activeBuses: TransitBusCandidate[]
  ): TransitBusCandidate | null {
    const stopBuses = activeBuses.filter(
      bus => bus.nextStopId === stop.id || bus.routeStops.includes(stop.id)
    );
    if (!stopBuses.length) return null;
    
    stopBuses.sort((a, b) => a.etaToStopSeconds - b.etaToStopSeconds);
    return stopBuses[0];
  }
}
