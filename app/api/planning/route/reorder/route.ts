import { NextResponse } from 'next/server';
import Route from '../../../../models/Route';

export async function PUT(req: Request) {
  try {
    const { routeId, orderedStops } = await req.json(); // Array of { stopId, distanceFromPreviousMeters, durationFromPreviousSeconds }

    // Validate duplicates
    const stopIds = orderedStops.map((s: any) => s.stopId);
    if (new Set(stopIds).size !== stopIds.length) {
      return NextResponse.json({ success: false, error: 'Sequence validation failed: Duplicate stops found in path.' }, { status: 400 });
    }

    const route = await Route.findById(routeId);
    if (!route) {
      return NextResponse.json({ success: false, error: 'Route not found' }, { status: 404 });
    }

    let newTotalDistance = 0;
    let newTotalDuration = 0;

    const structuredStops = orderedStops.map((stop: any, index: number) => {
      newTotalDistance += stop.distanceFromPreviousMeters || 0;
      newTotalDuration += stop.durationFromPreviousSeconds || 0;
      return {
        stopId: stop.stopId,
        sequenceOrder: index + 1,
        distanceFromPreviousMeters: stop.distanceFromPreviousMeters || 0,
        durationFromPreviousSeconds: stop.durationFromPreviousSeconds || 0
      };
    });

    route.orderedStops = structuredStops;
    route.totalDistanceMeters = newTotalDistance;
    route.totalDurationSeconds = newTotalDuration;

    await route.save();
    return NextResponse.json({ success: true, route });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
