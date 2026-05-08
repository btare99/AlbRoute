import mongoose from 'mongoose';

const RouteDataSchema = new mongoose.Schema({}, { timestamps: true, strict: false });

/**
 * Returns a route-specific model for drivers (Shoferet) and inspectors (Faturinot).
 * Each route has its own database (e.g., DB "1A" for route "1A").
 */
export function getRouteModel(routeId: string, type: 'Autobusat' | 'Shoferet' | 'Faturinot') {
  const dbName = routeId.startsWith('L') ? routeId.substring(1) : routeId;
  const db = mongoose.connection.useDb(dbName, { useCache: true });
  return db.model(type, RouteDataSchema, type);
}

/**
 * Operators are stored in the Global database, not per-route.
 * This ensures operator accounts are independent of line assignments.
 */
export function getOperatorModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return db.model('Operatoret', RouteDataSchema, 'Operatoret');
}

/**
 * All buses are stored in the Global database for easy cross-route access.
 */
export function getBusModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return db.model('Autobusat', RouteDataSchema, 'Autobusat');
}

export const ALL_ROUTES = [
  '1A', '1B', '2', '3A', '3B', '3C', '4', '5A', '5B', '6', '8A', '8B', '8C',
  '9A', '9B', '10A', '10B', '10C', '11', '12', '13A', '13B', '15A', '15B', '16A', '16B'
];
