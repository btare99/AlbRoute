import Route from '../../models/Route';
import Schedule from '../../models/Schedule';
import Trip from '../../models/Trip';

/**
 * Decomposes interval configurations into explicit departure times.
 */
export function generateDepartureTimes(schedule: any): Date[] {
  const departures: Date[] = [];
  const [firstH, firstM] = schedule.firstDepartureTime24.split(':').map(Number);
  const [lastH, lastM] = schedule.lastDepartureTime24.split(':').map(Number);

  let current = new Date();
  current.setHours(firstH, firstM, 0, 0);

  const limit = new Date();
  limit.setHours(lastH, lastM, 0, 0);

  while (current <= limit) {
    const timeStr = `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`;
    
    // Find matching peak window interval
    const matchedWindow = schedule.intervals.find((interval: any) => {
      return timeStr >= interval.startHour24 && timeStr < interval.endHour24;
    });

    departures.push(new Date(current));

    const stepMinutes = matchedWindow ? matchedWindow.intervalMinutes : 15; // default 15m
    current.setMinutes(current.getMinutes() + stepMinutes);
  }

  return departures;
}

/**
 * Automates Daily/Weekly scheduling with full database persistence.
 */
export async function generateTripsForDate(routeId: string, targetDate: string) {
  const targetDay = new Date(targetDate).getDay(); // 0-6 day mapping
  const route = await Route.findById(routeId);
  const schedule = await Schedule.findOne({ routeId, daysOfWeek: targetDay, isActive: true });

  if (!route || !schedule) {
    throw new Error('Route or matching Schedule template not found');
  }

  const departures = generateDepartureTimes(schedule);
  const createdTrips = [];

  for (const departureDate of departures) {
    const departureTimestamp = new Date(targetDate);
    departureTimestamp.setHours(departureDate.getHours(), departureDate.getMinutes(), 0, 0);

    const arrivalTimestamp = new Date(departureTimestamp);
    arrivalTimestamp.setSeconds(arrivalTimestamp.getSeconds() + route.totalDurationSeconds);

    const tripCode = `TRIP-${departureTimestamp.toISOString().split('T')[0]}-${route.routeCode}-${departureTimestamp.toTimeString().slice(0, 5).replace(':', '')}`;

    const newTrip = new Trip({
      tripCode,
      routeId: route._id,
      scheduleId: schedule._id,
      scheduledDepartureTime: departureTimestamp,
      scheduledArrivalTime: arrivalTimestamp,
      status: 'SCHEDULED'
    });

    createdTrips.push(newTrip);
  }

  // Bulk Insert for optimal database writes
  const saved = await Trip.insertMany(createdTrips);
  return { success: true, count: saved.length };
}
