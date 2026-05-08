import mongoose from 'mongoose';

const BusSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  routeId: { type: String, required: true },
  routeName: { type: String },
  routeLabel: { type: String },
  routeColor: { type: String },
  driverId: { type: String },
  inspectorId: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  currentPointIdx: { type: Number, default: 0 },
  direction: { type: String, enum: ['forward', 'return'] },
  speed: { type: Number },
  passengerLoad: { type: Number },
  nextStop: { type: String },
  delay: { type: Number },
  lastUpdate: { type: Date, default: Date.now },
  ticks: { type: Number, default: 0 },
  status: { type: String, default: 'Aktiv' },
}, { timestamps: true });

export default mongoose.models.Bus || mongoose.model('Bus', BusSchema);