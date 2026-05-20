import { NextResponse } from 'next/server';
import { calculateDynamicEta } from '../../../../lib/engines/etaEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    const seqIndexStr = searchParams.get('currentGpsSequenceIndex');

    if (!tripId) {
      return NextResponse.json({ success: false, error: 'Missing tripId parameter' }, { status: 400 });
    }

    const currentGpsSequenceIndex = seqIndexStr ? parseInt(seqIndexStr) : undefined;
    const eta = await calculateDynamicEta(tripId, currentGpsSequenceIndex);
    
    if (!eta) {
      return NextResponse.json({ success: false, error: 'Failed to calculate ETA or trip not active' }, { status: 400 });
    }

    return NextResponse.json({ success: true, eta });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
