import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      // required: true 
    }, // references the user
    orderId: { type: String, required: true }, // Razorpay order ID
    paymentId: { type: String },               // Razorpay payment ID
    signature: { type: String },               // Razorpay signature
    amount: { type: Number, required: true },  // in rupees
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "success", "failed", "pending"],
      default: "created",
    },
    method: { type: String }, // card, upi, netbanking etc.
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
