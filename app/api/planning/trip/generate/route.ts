import { NextResponse } from 'next/server';
import { generateTripsForDate } from '../../../../lib/engines/tripGenerator';

export async function POST(req: Request) {
  try {
    const { routeId, targetDate } = await req.json(); // targetDate: ISO string e.g. "2026-05-20"
    
    if (!routeId || !targetDate) {
      return NextResponse.json({ success: false, error: 'Missing routeId or targetDate parameters' }, { status: 400 });
    }

    const result = await generateTripsForDate(routeId, targetDate);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
