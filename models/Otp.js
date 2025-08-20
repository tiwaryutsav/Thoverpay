import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 🕒 expires in 5 minutes
});

// No `unique: true` on email — allows multiple OTPs if needed
const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
