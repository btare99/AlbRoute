import mongoose from 'mongoose';

const TripSchema = new mongoose.Schema({
  tripCode: { type: String, required: true, unique: true, index: true }, // e.g. "TRIP-20260519-L15A-0600"
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
  scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', index: true },
  
  scheduledDepartureTime: { type: Date, required: true, index: true },
  scheduledArrivalTime: { type: Date, required: true },
  
  actualDepartureTime: { type: Date },
  actualArrivalTime: { type: Date },
  
  assignedBusId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
  assignedDriverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
  assignedConductorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conductor' },
  
  status: {
    type: String,
    enum: ['SCHEDULED', 'BOARDING', 'EN_ROUTE', 'COMPLETED', 'DELAYED', 'CANCELLED', 'INTERRUPTED'],
    default: 'SCHEDULED',
    index: true
  },
  
  currentGpsSequenceIndex: { type: Number, default: 0 },
  delayMinutes: { type: Number, default: 0 },
  isDeviated: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);
