import { NextResponse } from 'next/server';
import Route from '../../../../models/Route';

export async function POST(req: Request) {
  try {
    const { routeCode, routeName, direction, terminalA, terminalB, isCircular, polylineCoordinates } = await req.json();

    const newRoute = new Route({
      routeCode,
      routeName,
      direction,
      terminalA,
      terminalB,
      isCircular,
      orderedStops: [],
      totalDistanceMeters: 0,
      totalDurationSeconds: 0,
      polylineCoordinates: polylineCoordinates || { type: 'LineString', coordinates: [] }
    });

    await newRoute.save();
    return NextResponse.json({ success: true, route: newRoute }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
