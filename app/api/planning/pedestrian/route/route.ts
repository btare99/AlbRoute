import { NextResponse } from 'next/server';
import { WalkingEngine } from '../../../../lib/engines/walkingEngine';

export async function POST(req: Request) {
  try {
    const { origin, destination, providerPriority } = await req.json(); // origin/destination: { lat, lng }

    if (!origin || !destination) {
      return NextResponse.json({ success: false, error: 'Missing origin or destination coordinates' }, { status: 400 });
    }

    const engine = new WalkingEngine();
    const route = await engine.calculateWalkingRoute(origin, destination, providerPriority);
    
    return NextResponse.json({ success: true, route });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
