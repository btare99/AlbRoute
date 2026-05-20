import Trip from '../../models/Trip';

export class ConflictEngine {
  /**
   * Checks for overlapping trip schedules and driver labor duty hour constraints.
   */
  static async checkAssignmentConflicts(params: {
    driverId: string;
    busId: string;
    startTime: Date;
    endTime: Date;
    excludingTripId?: string;
  }) {
    const conflicts: any[] = [];
    const minTurnaroundMs = 15 * 60 * 1000; // 15 mins turnaround window

    const rangeStart = new Date(new Date(params.startTime).getTime() - minTurnaroundMs);
    const rangeEnd = new Date(new Date(params.endTime).getTime() + minTurnaroundMs);

    const overlapQuery: any = {
      $or: [
        { scheduledDepartureTime: { $gte: rangeStart, $lte: rangeEnd } },
        { scheduledArrivalTime: { $gte: rangeStart, $lte: rangeEnd } },
        {
          scheduledDepartureTime: { $lte: rangeStart },
          scheduledArrivalTime: { $gte: rangeEnd }
        }
      ],
      status: { $in: ['SCHEDULED', 'BOARDING', 'EN_ROUTE'] }
    };

    if (params.excludingTripId) {
      overlapQuery._id = { $ne: params.excludingTripId };
    }

    const concurrentTrips = await Trip.find(overlapQuery);

    for (const trip of concurrentTrips) {
      // 1. Bus Conflict
      if (trip.assignedBusId && trip.assignedBusId.toString() === params.busId.toString()) {
        conflicts.push({
          type: 'BUS_OVERLAP',
          tripId: trip._id,
          message: `Bus is already assigned to active Trip ${trip.tripCode} during this period.`
        });
      }

      // 2. Driver Conflict
      if (trip.assignedDriverId && trip.assignedDriverId.toString() === params.driverId.toString()) {
        conflicts.push({
          type: 'DRIVER_OVERLAP',
          tripId: trip._id,
          message: `Driver is already assigned to active Trip ${trip.tripCode} during this period.`
        });
      }
    }

    // 3. Labor Rule Compliance (Max 9-Hour driving duration per day)
    const dayStart = new Date(params.startTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(params.startTime);
    dayEnd.setHours(23, 59, 59, 999);

    const driversDailyTrips = await Trip.find({
      assignedDriverId: params.driverId,
      scheduledDepartureTime: { $gte: dayStart, $lte: dayEnd },
      status: { $ne: 'CANCELLED' }
    });

    let totalDurationSeconds = 0;
    driversDailyTrips.forEach((t: any) => {
      const tripDuration = (t.scheduledArrivalTime.getTime() - t.scheduledDepartureTime.getTime()) / 1000;
      totalDurationSeconds += tripDuration;
    });

    const proposedDurationSeconds = (new Date(params.endTime).getTime() - new Date(params.startTime).getTime()) / 1000;
    const maxAllowedShiftSeconds = 9 * 3600; // 9 hours limit

    if ((totalDurationSeconds + proposedDurationSeconds) > maxAllowedShiftSeconds) {
      conflicts.push({
        type: 'DRIVER_HOURS_EXCEEDED',
        message: `Driver daily duty duration exceeds safety limits (9 Hours max). Proposed total: ${((totalDurationSeconds + proposedDurationSeconds) / 3600).toFixed(1)} hours.`
      });
    }

    return {
      isValid: conflicts.length === 0,
      conflicts
    };
  }
}
