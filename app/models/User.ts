import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Ju lutem jepni një emër'],
  },
  email: {
    type: String,
    required: [true, 'Ju lutem jepni një email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Ju lutem jepni një fjalëkalim'],
    minlength: 6,
  },
  phone: {
    type: String,
    required: false,
  },
  savedLocations: {
    home: { type: String, default: '' },
    work: { type: String, default: '' },
  },
  travelHistory: {
    type: Array,
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || model('User', UserSchema);

export default User;
