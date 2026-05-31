import mongoose from 'mongoose';

// ─── Tipi i koleksioneve të disponueshme për çdo linjë (FIX #3) ─────────────

export type RouteCollectionType =
  | 'Autobusat'
  | 'Shoferet'
  | 'Faturinot'
  | 'Vleresimet';

// ─── RouteDataSchema ─────────────────────────────────────────────────────────
//
// strict: false përdoret me qëllim: koleksionet si Autobusat, Shoferet etj.
// kanë strukturë dinamike dhe ndryshojnë sipas linjës. Të dhënat vijnë
// vetëm nga burime të besuara (sistemi i brendshëm), jo nga input i jashtëm.
// FIX #1: dokumentuar qartë arsyeja e strict: false
//
const RouteDataSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
    // strict: false i lejon fusha dinamike për koleksione me strukturë
    // të ndryshueshme (p.sh. telemetria e autobusëve, të dhëna shoferi).
    // KUJDES: përdor vetëm me burime të besuara, jo me input nga API publik.
    strict: false,
  }
);

// ─── Nën-schema për travelHistory (FIX #7) ───────────────────────────────────

const TravelHistorySchema = new mongoose.Schema(
  {
    routeId:   { type: String },
    stationId: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─── Nën-schema për subscriptions (FIX #7) ───────────────────────────────────

const SubscriptionSchema = new mongoose.Schema(
  {
    type:      { type: String },  // 'general' | 'student' | 'tourist' | 'single_line'
    line:      { type: String, default: null },
    expiresAt: { type: Date },
    active:    { type: Boolean, default: true },
  },
  { _id: false }
);

// ─── UserSchema ───────────────────────────────────────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Opsional për Google OAuth users

    phone: { type: String, default: '' },

    savedLocations: {
      home: { type: String, default: '' },
      work: { type: String, default: '' },
    },

    // FIX #7: Array me tip të përcaktuar (nën-schema) në vend të Array të zbrazët
    travelHistory: { type: [TravelHistorySchema], default: [] },
    subscriptions: { type: [SubscriptionSchema], default: [] },

    // Fusha për abonim linje
    idNumber:     { type: String, default: null },
    university:   { type: String, default: null },
    serialNumber: { type: String, default: null },
    selectedLine: { type: String, default: null },

    // Reset password — FIX #6: index për kërkim të shpejtë
    resetCode:        { type: String, default: null, index: true },
    resetToken:       { type: String, default: null, index: true },
    resetCodeExpires: { type: Date,   default: null },

    // FIX #2: Date.now pa kllapa — mongoose e thërret si funksion për çdo dokument të ri
    lastLogin: { type: Date, default: Date.now },

    lastLocation: {
      lat:       { type: Number },
      lng:       { type: Number },
      updatedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

// ─── Modelet ─────────────────────────────────────────────────────────────────

/**
 * Kthen modelin global të autobusëve (fleet tracking).
 * Ruhen në database-in 'Global', koleksioni 'Autobusat'.
 */
export function getBusModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return (
    db.models.Autobusat ||
    db.model('Autobusat', RouteDataSchema, 'Autobusat')
  );
}

/**
 * Kthen modelin për një koleksion specifik brenda database-it të linjës.
 * FIX #3: type ka union të mbyllur (RouteCollectionType) — nuk pranon string arbitrar
 * FIX #4: routeId normalizohet (trim + toUpperCase) para përdorimit
 *
 * @param routeId  p.sh. '1A', 'L3B', '15A'
 * @param type     koleksioni brenda database-it të linjës
 */
export function getRouteModel(routeId: string, type: RouteCollectionType) {
  // FIX #4: normalize input — trajton '1a', 'L1A', ' 1A ' njësoj
  const normalized = routeId.trim().toUpperCase();
  const dbName = normalized.startsWith('L')
    ? normalized.substring(1)
    : normalized;

  const db = mongoose.connection.useDb(dbName, { useCache: true });
  return db.models[type] || db.model(type, RouteDataSchema, type);
}

/**
 * Kthen modelin e Operatorëve (Dispatcher, Admin) — ruhen në 'Global'.
 */
export function getOperatorModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return (
    db.models.Operatoret ||
    db.model('Operatoret', RouteDataSchema, 'Operatoret')
  );
}

/**
 * Kthen modelin e Udhëtarëve (pasagjerë) — ruhen në 'Global'.
 */
export function getUserModel() {
  const db = mongoose.connection.useDb('Global', { useCache: true });
  return (
    db.models.Udhetaret ||
    db.model('Udhetaret', UserSchema, 'Udhetaret')
  );
}

// ─── Lista e të gjitha linjave aktive ────────────────────────────────────────

export const ALL_ROUTES = [
  '1A', '1B', '2',
  '3A', '3B', '3C',
  '4',
  '5A', '5B',
  '6',
  '8A', '8B', '8C',
  '9A', '9B',
  '10A', '10B', '10C',
  '11', '12',
  '13A', '13B',
  '15A', '15B',
  '16A', '16B',
] as const;

// Tip i dedikuar për routeId — TypeScript do të tregojë gabim nëse përdoret linjë e panjohur
export type RouteId = typeof ALL_ROUTES[number];