import Trip from '../../models/Trip';

// ── Konstantet ────────────────────────────────────────────────────────────────
const TURNAROUND_MS = 15 * 60 * 1000;   // 15 min buffer ndërmjet udhëtimeve
const MAX_SHIFT_HOURS = 9;                 // Límiti ligjor i orarit ditor
const ACTIVE_STATUSES = ['SCHEDULED', 'BOARDING', 'EN_ROUTE'] as const;

// ── Tipet ─────────────────────────────────────────────────────────────────────
enum ConflictType {
  BUS_OVERLAP = 'BUS_OVERLAP',
  DRIVER_OVERLAP = 'DRIVER_OVERLAP',
  DRIVER_HOURS_EXCEEDED = 'DRIVER_HOURS_EXCEEDED',
}

interface Conflict {
  type: ConflictType;
  tripId?: string;
  message: string;
}

interface AssignmentParams {
  driverId: string;
  busId: string;
  startTime: Date;
  endTime: Date;
  excludingTripId?: string;
}

export interface ConflictResult {
  isValid: boolean;
  conflicts: Conflict[];
}

// ── Engine ────────────────────────────────────────────────────────────────────
export class ConflictEngine {
  static async checkAssignmentConflicts(params: AssignmentParams): Promise<ConflictResult> {
    if (!params.driverId || !params.busId) {
      throw new Error('driverId and busId are required.');
    }

    const conflicts: Conflict[] = [];

    // Overlap window me turnaround buffer
    const rangeStart = new Date(params.startTime.getTime() - TURNAROUND_MS);
    const rangeEnd = new Date(params.endTime.getTime() + TURNAROUND_MS);

    const excludeFilter = params.excludingTripId
      ? { _id: { $ne: params.excludingTripId } }
      : {};

    const overlapCondition = {
      $or: [
        { scheduledDepartureTime: { $gte: rangeStart, $lte: rangeEnd } },
        { scheduledArrivalTime: { $gte: rangeStart, $lte: rangeEnd } },
        { scheduledDepartureTime: { $lte: rangeStart }, scheduledArrivalTime: { $gte: rangeEnd } },
      ],
      status: { $in: ACTIVE_STATUSES },
      ...excludeFilter,
    };

    const dayStart = new Date(params.startTime).setHours(0, 0, 0, 0);
    const dayEnd = new Date(params.startTime).setHours(23, 59, 59, 999);

    // 3 queries paralele — bus overlap, driver overlap, orët ditore
    const [busTrips, driverTrips, dailyTrips] = await Promise.all([
      Trip.find({ ...overlapCondition, assignedBusId: params.busId })
        .select('_id tripCode'),
      Trip.find({ ...overlapCondition, assignedDriverId: params.driverId })
        .select('_id tripCode'),
      Trip.find({
        assignedDriverId: params.driverId,
        scheduledDepartureTime: { $gte: dayStart, $lte: dayEnd },
        status: { $ne: 'CANCELLED' },
        ...excludeFilter,
      }).select('scheduledDepartureTime scheduledArrivalTime'),
    ]);

    // Bus konflikte
    for (const trip of busTrips) {
      conflicts.push({
        type: ConflictType.BUS_OVERLAP,
        tripId: trip._id.toString(),
        message: `Bus është caktuar tashmë për udhëtimin ${trip.tripCode} gjatë kësaj periudhe.`,
      });
    }

    // Driver konflikte
    for (const trip of driverTrips) {
      conflicts.push({
        type: ConflictType.DRIVER_OVERLAP,
        tripId: trip._id.toString(),
        message: `Shoferi është caktuar tashmë për udhëtimin ${trip.tripCode} gjatë kësaj periudhe.`,
      });
    }

    // Labor rule — max 9 orë/ditë
    const existingSeconds = dailyTrips.reduce((sum, t) => {
      if (!t.scheduledDepartureTime || !t.scheduledArrivalTime) return sum;
      const duration = (t.scheduledArrivalTime.getTime() - t.scheduledDepartureTime.getTime()) / 1000;
      return sum + Math.max(0, duration);
    }, 0);

    const proposedSeconds = (params.endTime.getTime() - params.startTime.getTime()) / 1000;
    const totalSeconds = existingSeconds + proposedSeconds;
    const maxSeconds = MAX_SHIFT_HOURS * 3600;

    if (totalSeconds > maxSeconds) {
      conflicts.push({
        type: ConflictType.DRIVER_HOURS_EXCEEDED,
        message: `Orari ditor tejkalon limitin ligjor prej ${MAX_SHIFT_HOURS}h. Total i propozuar: ${(totalSeconds / 3600).toFixed(1)}h.`,
      });
    }

    return { isValid: conflicts.length === 0, conflicts };
  }
}