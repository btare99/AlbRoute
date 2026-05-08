import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  role: { type: String, enum: ['dispatcher', 'operator', 'driver', 'inspector'], required: true },
  routeId: { type: String },
  weeklyProgram: { type: Object, default: {} },
  status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model('Staff', StaffSchema);