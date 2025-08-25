import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
    default: "PENDING"
  },
  paymentMode: {
    type: String
  },
  referenceId: {
    type: String // Cashfree transaction reference ID
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
