import Route from '../../models/Route';
import Schedule from '../../models/Schedule';
import Trip from '../../models/Trip';

// ── Konstantet ────────────────────────────────────────────────────────────────
const DEFAULT_INTERVAL_MINUTES = 15;

// ── Tipet ─────────────────────────────────────────────────────────────────────
interface ScheduleInterval {
  startHour24: string; // "08:00"
  endHour24: string; // "10:00"
  intervalMinutes: number;
}

interface ScheduleTemplate {
  firstDepartureTime24: string;
  lastDepartureTime24: string;
  intervals: ScheduleInterval[];
}

interface GenerateTripsResult {
  success: boolean;
  count: number;
  date: string;
  routeId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Konverton "HH:MM" → minuta totale — krahasim numerik, jo leksikografik */
function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Gjeneron tripCode nga komponentët e saj */
function buildTripCode(routeCode: string, departureTimetamp: Date): string {
  const date = departureTimetamp.toISOString().split('T')[0];
  const time = `${String(departureTimetamp.getHours()).padStart(2, '0')}${String(departureTimetamp.getMinutes()).padStart(2, '0')}`;
  return `TRIP-${date}-${routeCode}-${time}`;
}

/** Zbërthen konfigurimin e intervaleve në orare konkrete nisje */
export function generateDepartureTimes(
  schedule: ScheduleTemplate,
  targetDate: Date
): Date[] {
  const departures: Date[] = [];

  const firstMinutes = parseTimeToMinutes(schedule.firstDepartureTime24);
  const lastMinutes = parseTimeToMinutes(schedule.lastDepartureTime24);

  let currentMinutes = firstMinutes;

  while (currentMinutes <= lastMinutes) {
    const matchedWindow = schedule.intervals.find(interval =>
      currentMinutes >= parseTimeToMinutes(interval.startHour24) &&
      currentMinutes < parseTimeToMinutes(interval.endHour24)
    );

    const departure = new Date(targetDate);
    departure.setHours(
      Math.floor(currentMinutes / 60),
      currentMinutes % 60,
      0, 0
    );
    departures.push(departure);

    currentMinutes += matchedWindow?.intervalMinutes ?? DEFAULT_INTERVAL_MINUTES;
  }

  return departures;
}

/** Gjeneron dhe ruan në DB të gjitha udhëtimet për një datë dhe linjë */
export async function generateTripsForDate(
  routeId: string,
  targetDate: string
): Promise<GenerateTripsResult> {
  const targetDay = new Date(targetDate).getDay();

  const [route, schedule] = await Promise.all([
    Route.findById(routeId),
    Schedule.findOne({ routeId, daysOfWeek: targetDay, isActive: true })
  ]);

  if (!route || !schedule) {
    throw new Error(`Route or Schedule not found — routeId: ${routeId}, day: ${targetDay}`);
  }

  const baseDate = new Date(targetDate);
  const departures = generateDepartureTimes(schedule, baseDate);

  const trips = departures.map(departure => {
    const arrival = new Date(departure.getTime() + route.totalDurationSeconds * 1000);

    return {
      tripCode: buildTripCode(route.routeCode, departure),
      routeId: route._id,
      scheduleId: schedule._id,
      scheduledDepartureTime: departure,
      scheduledArrivalTime: arrival,
      status: 'SCHEDULED',
    };
  });

  const saved = await Trip.insertMany(trips, { ordered: false });

  return {
    success: true,
    count: saved.length,
    date: targetDate,
    routeId,
  };
}