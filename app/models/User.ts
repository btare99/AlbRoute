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
    required: false,
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
  avatar: {
    type: String,
    default: null,
  },
  lastLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date, default: Date.now }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

const User = models.User || model('User', UserSchema);

export default User;
