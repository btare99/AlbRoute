import mongoose from 'mongoose';

const SavedRouteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  // Add fields as needed, e.g., userId, route details
}, { timestamps: true });

export default mongoose.models.SavedRoute || mongoose.model('SavedRoute', SavedRouteSchema);