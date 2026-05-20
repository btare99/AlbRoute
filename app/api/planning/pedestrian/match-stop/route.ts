import { NextResponse } from 'next/server';
import { WalkingEngine } from '../../../../lib/engines/walkingEngine';
import { TransitOptimizer, TransitStopCandidate, TransitBusCandidate } from '../../../../lib/engines/transitOptimizer';

export async function POST(req: Request) {
  try {
    const { passengerGps, candidateStops, activeBuses } = await req.json();

    if (!passengerGps || !candidateStops || !activeBuses) {
      return NextResponse.json({ success: false, error: 'Missing passengerGps, candidateStops, or activeBuses' }, { status: 400 });
    }

    const walkingEngine = new WalkingEngine();
    const optimalSelection = await TransitOptimizer.selectBestBoardingStop(
      passengerGps,
      candidateStops as TransitStopCandidate[],
      activeBuses as TransitBusCandidate[],
      walkingEngine
    );

    if (!optimalSelection) {
      return NextResponse.json({ success: false, error: 'No reachable optimal stops found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, optimalSelection });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
