import mongoose from 'mongoose';

const DepartureIntervalSchema = new mongoose.Schema({
  startHour24: { type: String, required: true }, // e.g. "06:00"
  endHour24: { type: String, required: true },   // e.g. "09:00"
  intervalMinutes: { type: Number, required: true } // e.g. 10
});

const ScheduleSchema = new mongoose.Schema({
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true, index: true },
  daysOfWeek: [{ type: Number, enum: [0, 1, 2, 3, 4, 5, 6] }], // 0=Sunday, 1=Monday...
  
  firstDepartureTime24: { type: String, required: true }, // e.g. "05:30"
  lastDepartureTime24: { type: String, required: true },  // e.g. "23:00"
  
  intervals: [DepartureIntervalSchema], // Configurable peak/off-peak windows
  minimumTurnaroundMinutes: { type: Number, default: 15 },
  
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
