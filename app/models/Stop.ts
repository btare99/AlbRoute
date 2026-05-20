import mongoose from 'mongoose';

const StopSchema = new mongoose.Schema({
  stopCode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  isTerminal: { type: Boolean, default: false }
}, { timestamps: true });

// Check 2dsphere index for geolocation searches
StopSchema.index({ location: '2dsphere' });

export default mongoose.models.Stop || mongoose.model('Stop', StopSchema);
