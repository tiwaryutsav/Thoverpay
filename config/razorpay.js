// utils/razorpay.js
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,      // from your .env file
  key_secret: process.env.RAZORPAY_KEY_SECRET,  // from your .env file
});

export default razorpay;
