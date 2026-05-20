import mongoose from 'mongoose';

const StopSequenceSchema = new mongoose.Schema({
  stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  sequenceOrder: { type: Number, required: true },
  distanceFromPreviousMeters: { type: Number, required: true },
  durationFromPreviousSeconds: { type: Number, required: true }
});

const RouteSchema = new mongoose.Schema({
  routeCode: { type: String, required: true, unique: true, index: true }, // e.g. "L15-A"
  routeName: { type: String, required: true },
  direction: { type: String, enum: ['A', 'B'], required: true },
  isCircular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, index: true },
  
  terminalA: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  terminalB: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  
  orderedStops: [StopSequenceSchema],
  totalDistanceMeters: { type: Number, required: true },
  totalDurationSeconds: { type: Number, required: true },
  
  polylineCoordinates: {
    type: { type: String, default: 'LineString' },
    coordinates: [[Number]] // Array of [longitude, latitude] arrays
  }
}, { timestamps: true });

RouteSchema.index({ polylineCoordinates: '2dsphere' });

export default mongoose.models.Route || mongoose.model('Route', RouteSchema);
