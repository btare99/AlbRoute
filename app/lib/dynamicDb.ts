import mongoose from 'mongoose';

const RouteDataSchema = new mongoose.Schema({}, { timestamps: true, strict: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Made optional for Google users
  phone: { type: String, default: '' },
  savedLocations: {
    home: { type: String, default: '' },
    work: { type: String, default: '' },
  },
  travelHistory: { type: Array, default: [] },
  subscriptionPhoto: { type: String, default: null },
  idNumber: { type: String, default: null },
  university: { type: String, default: null },
  serialNumber: { type: String, default: null },
  selectedLine: { type: String, default: null },
  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Date, default: null },
  lastLogin: { type: Date, default: null },
}, { timestamps: true });

/**
 * Returns the global Buses model (used by the main app for fleet tracking).
 * Buses are stored in the 'Global' database, 'Autobusat' collection.
 */
export function getBusModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return db.models.Autobusat || db.model('Autobusat', RouteDataSchema, 'Autobusat');
}

/**
 * Returns a model for staff/data within a specific Route's database.
 * @param routeId e.g., '1A', '3B'
 * @param collection e.g., 'Shoferet', 'Faturinot', 'Vleresimet'
 */
export function getRouteModel(routeId: string, type: 'Autobusat' | 'Shoferet' | 'Faturinot' | string) {
  const dbName = routeId.startsWith('L') ? routeId.substring(1) : routeId;
  const db = mongoose.connection.useDb(dbName, { useCache: true });
  return db.models[type] || db.model(type, RouteDataSchema, type);
}


/**
 * Returns the Operator model for platform-wide staff (Dispatchers, Admins).
 * These are stored in the 'Global' database.
 */
export function getOperatorModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return db.models.Operatoret || db.model('Operatoret', RouteDataSchema, 'Operatoret');
}

/**
 * Returns the User model for passengers.
 * These are stored in the 'Global' database.
 */
export function getUserModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return db.models.Udhetaret || db.model('Udhetaret', UserSchema, 'Udhetaret');
}

export const ALL_ROUTES = [

  '1A', '1B', '2', '3A', '3B', '3C', '4', '5A', '5B', '6', '8A', '8B', '8C',
  '9A', '9B', '10A', '10B', '10C', '11', '12', '13A', '13B', '15A', '15B', '16A', '16B'
];
