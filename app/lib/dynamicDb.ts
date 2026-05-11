import mongoose from 'mongoose';

const RouteDataSchema = new mongoose.Schema({}, { timestamps: true, strict: false });

/**
 * Returns the global Buses model (used by the main app for fleet tracking).
 * Buses are stored in the 'Global' database, 'Autobusat' collection.
 */
export function getBusModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  // We use RouteDataSchema with strict: false to be flexible with the data coming from Backoffice
  return db.model('Autobusat', RouteDataSchema, 'Autobusat');
}

export const ALL_ROUTES = [
  '1A', '1B', '2', '3A', '3B', '3C', '4', '5A', '5B', '6', '8A', '8B', '8C',
  '9A', '9B', '10A', '10B', '10C', '11', '12', '13A', '13B', '15A', '15B', '16A', '16B'
];
