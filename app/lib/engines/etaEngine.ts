import Trip from '../../models/Trip';
import Route from '../../models/Route';

/**
 * Dynamic ETA Calculation based on GPS sequence progress, average route velocity, and traffic metrics.
 */
export async function calculateDynamicEta(tripId: string, currentGpsSequenceIndex?: number) {
  const trip = await Trip.findById(tripId);
  if (!trip || trip.status !== 'EN_ROUTE') return null;

  const route = await Route.findById(trip.routeId);
  if (!route) return null;

  const stops = route.orderedStops;
  const currentIndex = currentGpsSequenceIndex ?? trip.currentGpsSequenceIndex;
  
  if (currentIndex >= stops.length - 1) {
    return { tripId, nextStop: null, etaSeconds: 0 };
  }

  // Calculate distance-to-go along the sequence path
  let distanceToGoMeters = 0;
  for (let i = currentIndex + 1; i < stops.length; i++) {
    distanceToGoMeters += stops[i].distanceFromPreviousMeters;
  }

  // Fetch rolling average velocity (e.g. ~40 km/h in meters/sec base)
  const baseVelocityMPS = 11.1; 

  // Dynamic traffic multiplier depending on time of day
  const hours = new Date().getHours();
  let trafficMultiplier = 1.0;
  if ((hours >= 8 && hours <= 10) || (hours >= 17 && hours <= 19)) {
    trafficMultiplier = 1.4; // Peak-hour delay factor
  }

  const adjustedVelocity = baseVelocityMPS / trafficMultiplier;
  const etaSeconds = Math.round(distanceToGoMeters / adjustedVelocity);

  const expectedArrival = new Date();
  expectedArrival.setSeconds(expectedArrival.getSeconds() + etaSeconds);

  return {
    tripId,
    nextStopId: stops[currentIndex + 1].stopId,
    etaSeconds,
    expectedArrivalTime: expectedArrival
  };
}
