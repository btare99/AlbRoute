import mongoose from 'mongoose';

const RouteDeviationSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
  description: { type: String },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true, index: true },
  
  skippedStops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stop' }],
  temporaryStops: [{
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
    sequenceOrder: Number,
    distanceFromPreviousMeters: Number,
    durationFromPreviousSeconds: Number
  }],
  
  temporaryPolylineCoordinates: {
    type: { type: String, default: 'LineString' },
    coordinates: [[Number]]
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.RouteDeviation || mongoose.model('RouteDeviation', RouteDeviationSchema);
