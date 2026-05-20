import { NextResponse } from 'next/server';
import Trip from '../../../../models/Trip';
import { ConflictEngine } from '../../../../lib/engines/conflictEngine';

export async function POST(req: Request) {
  try {
    const { tripId, assignedBusId, assignedDriverId, assignedConductorId } = await req.json();

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ success: false, error: 'Target Trip not found' }, { status: 404 });
    }

    // Full validation against hardware and driver time constraints
    const validation = await ConflictEngine.checkAssignmentConflicts({
      driverId: assignedDriverId,
      busId: assignedBusId,
      startTime: trip.scheduledDepartureTime,
      endTime: trip.scheduledArrivalTime,
      excludingTripId: tripId
    });

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        reason: 'ASSIGNMENT_CONFLICT',
        conflicts: validation.conflicts
      }, { status: 409 });
    }

    // Save assignments safely
    trip.assignedBusId = assignedBusId;
    trip.assignedDriverId = assignedDriverId;
    if (assignedConductorId) {
      trip.assignedConductorId = assignedConductorId;
    }

    await trip.save();
    return NextResponse.json({ success: true, trip });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
