import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendSMS, verifyOTP } from '../services/twilioService.js';
import * as twilioService from '../services/twilioService.js'; // Correct the path as needed
import catchAsync from '../utils/catchAsync.js';
// import Post from '../models/Post.js';  // Adjust the path as needed
// import Vibe from '../models/Vibe.js';
import mongoose from 'mongoose';  // Add this line at the top of your file
// import Favorite from '../models/Favorite.js';
// import { Connection } from '../models/Connection.js'; // adjust path as needed
import { sendOtpToEmail, verifyOtp } from '../services/otpService.js';
// import Report from '../models/Report.js';
// import Feedback from '../models/Feedback.js';
import axios from 'axios';
// import Referral from '../models/referral.js';
// import Spotlite from '../models/Spotlite.js';
import crypto from 'crypto'; // 
import { v4 as uuidv4 } from 'uuid';
// import csv from 'csv-parser';
import fs from 'fs';
import moment from 'moment';
// import LaunchPad from '../models/LaunchPad.js';
// At the top of your authController.js
// import Otp from '../models/Otp.js'; // adjust the path if needed
// import crypto from "crypto";
import Wallet from '../models/Wallet.js';
import Transaction from "../models/Transactions.js";
import LoyaltyCard from "../models/Loyalty.js";
// import razorpay from "../config/razorpay.js";   // ✅ Razorpay instance
import cashfreeConfig from "../config/cashfree.js";
import Payment from "../models/Payment.js";    // ✅ Payment model
// import Order from "../models/Order.js";

// Route to send OTP using Twilio Verify API




// Route to login user



//Route to add post




//Route to get all user Details


// Route to add a vibe




export const getUserid = catchAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token is required'
    });
  }

  // Find user by their token (assuming token is stored as a field in the User model)
  const user = await User.findOne({ token }).select('userId'); // Only select userId field

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    userId: user.userId // Only send back the userId
  });
});

//Route to get all the vibes through postid


// Route to update profile
export const updateUserProfile = catchAsync(async (req, res) => {
  const { bio, name } = req.body; // ✅ Changed 'Bio' to 'bio'

  // 1. Ensure the user is authenticated
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User not logged in',
    });
  }

  // 2. Fetch the full user record
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // 3. Apply updates (excluding phoneNumber and username)
  if (bio) user.bio = bio;       // ✅ Corrected field update
  if (name) user.name = name;

  await user.save();

  // 4. Send back updated info
  res.status(200).json({
    success: true,
    message: 'User profile updated successfully',
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      bio: user.bio  // ✅ Ensure it matches schema
    }
  });
});




//upadte username
export const updateUsername = catchAsync(async (req, res) => {
  const { oldUsername, newUsername } = req.body;

  // 1. Ensure the user is authenticated
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: User not logged in',
    });
  }

  // 2. Fetch the user
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // 3. Validate old username
  if (user.username !== oldUsername) {
    return res.status(400).json({
      success: false,
      message: 'Old username does not match our records',
    });
  }

  // 4. Validate new username
  if (!newUsername || !newUsername.trim()) {
    return res.status(400).json({
      success: false,
      message: 'New username is required',
    });
  }

  // 5. Check if the new username is already taken
  const existingUser = await User.findOne({ username: newUsername });
  if (existingUser && existingUser._id.toString() !== user._id.toString()) {
    return res.status(409).json({
      success: false,
      message: 'Username is already taken',
    });
  }

  // 6. Update username
  user.username = newUsername;
  await user.save();

  // 7. Respond
  res.status(200).json({
    success: true,
    message: 'Username updated successfully',
    user: {
      _id: user._id,
      username: user.username
    }
  });
});


//Route to update password using otp



//Route to get all the post



//Route to get vives through postid



//update profile pic




//Route to fetch location


//Route to get post using postid




//Route to unfollow


//Route to add like a vibe


//Route to unlike


//Route to get all posts through useri




//Route to get maximum postid



//Route for favoirate



//Route for unfavorite




//route to set area



//Route to set accunt info
// controllers/userController.js




//Route to check favorite post

//Route to get connected To
export const sendOTP_email = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email is already registered',
    });
  }

  try {
    await sendOtpToEmail(email);
    res.json({
      success: true,
      message: 'OTP sent to email successfully',
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
    });
  }
});

//route to register through otp

export const register_email = catchAsync(async (req, res) => {
  const { email, otp, userData } = req.body;

  if (!email || !otp || !userData) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP, and user data are required'
    });
  }

  const result = verifyOtp(email, otp);
  if (!result.success) {
    return res.status(401).json({
      success: false,
      message: result.message
    });
  }

  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered'
    });
  }

  const newUser = await User.create({
    username: userData.username,
    password: userData.password,  // यहाँ password plain ही रहेगा
    email: userData.email,
    name: userData.name,
  });

  const token = await newUser.generateAuthToken();

  res.json({
    success: true,
    message: 'Registration successful',
    userId: newUser._id,
    token
  });
});


//Route to update password through email_otp
export const updatePasswordWithEmailOtp = catchAsync(async (req, res) => {
  const { email, otp, userData } = req.body;

  if (
    !email ||
    !otp ||
    !userData ||
    !userData.password ||
    !userData.confirmPassword
  ) {
    return res.status(400).json({
      success: false,
      message: 'Email, OTP, password, and confirm password are required',
    });
  }

  if (userData.password !== userData.confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password and confirm password do not match',
    });
  }

  // Use the verifyOtp function you already have
  const verification = await verifyOtp(email, otp);

  if (!verification || !verification.success) {
    return res.status(401).json({
      success: false,
      message: verification?.message || 'Invalid or expired OTP',
    });
  }

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Set new password and save
  existingUser.password = userData.password;
  await existingUser.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});


// 🔧 Utility to generate unique 8-character referral code


//Login with email
export const loginWithEmail = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No user found with that email'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = await user.generateAuthToken();

  res.json({
    success: true,
    message: 'Login successful',
    token,
    userId: user._id
  });
});

export const searchByUsername = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username query must be at least 3 characters',
      });
    }

    const users = await User.find({
      username: { $regex: new RegExp('^' + username, 'i') } // starts with input
    }).select('username name email');

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};



export const sendOTP_resetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Send OTP only if email exists
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(404).json({ success: false, message: 'Email not found' });
  }

  try {
    await sendOtpToEmail(email);
    res.json({ success: true, message: 'OTP sent to reset password' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});




//Route to count total number of users
export const getTotalUsers = catchAsync(async (req, res) => {
  const totalUsers = await User.countDocuments();

  res.status(200).json({
    success: true,
    totalUsers,
  });
});


function generateRandomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const createWallet = async (req, res) => {
  try {
    const { walletName } = req.body;

    if (!walletName) {
      return res.status(400).json({
        success: false,
        message: "walletName is required"
      });
    }

    const isLoggedIn = !!req.user; // true if token valid & user found

    // ✅ If logged in, check if wallet already exists
    if (isLoggedIn) {
      let existingWallet = await Wallet.findOne({ userId: req.user._id });

      if (existingWallet) {
        // 👉 Append 5 new codes instead of rejecting
        for (let i = 0; i < 5; i++) {
          const nextIndex = existingWallet.redeemCode.size.toString();
          existingWallet.redeemCode.set(nextIndex, generateRandomCode());
        }

        await existingWallet.save();

        return res.status(200).json({
          success: true,
          message: "5 new codes added to existing wallet",
          data: existingWallet
        });
      }
    } else {
      // ✅ If guest, check if they already have a wallet
      let guestWallet = await Wallet.findOne({ isGuest: true, walletName });
      if (guestWallet) {
        return res.status(400).json({
          success: false,
          message: "Guest wallet already exists",
          data: guestWallet
        });
      }
    }

    // ✅ If no wallet exists → create one
    const wallet = new Wallet({
      walletName,
      userId: isLoggedIn ? req.user._id : null,
      isGuest: !isLoggedIn,
      walletType: "personal",
      professionalWallet: false,
      redeemCode: {}
    });

    if (isLoggedIn) {
      // Logged-in user gets 5 codes
      for (let i = 0; i < 5; i++) {
        wallet.redeemCode.set(i.toString(), generateRandomCode());
      }
    } else {
      // Guest gets only 1 code
      wallet.redeemCode.set("0", generateRandomCode());
    }

    await wallet.save();

    return res.status(201).json({
      success: true,
      message: isLoggedIn ? "Wallet created with 5 codes" : "Guest wallet created with 1 code",
      data: wallet
    });

  } catch (error) {
    console.error("Create wallet error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const submitKycDetails = catchAsync(async (req, res) => {
  const userId = req.user._id; // logged-in user id
  const { kyc_documents } = req.body; // array of objects

  // Validate that kyc_documents is a non-empty array
  if (!Array.isArray(kyc_documents) || kyc_documents.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'KYC documents are required and must be a non-empty array',
    });
  }

  // Update user's KYC details
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        'kyc_details.kycStatus': 'pending',
        'kyc_details.kyc_documents': kyc_documents, // store as array
      },
    },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'KYC details submitted successfully. Status is now pending.',
    data: updatedUser.kyc_details,
  });
});


export const buyCoin = async (req, res) => {
  try {
    const { walletId, coins } = req.body; // coins = number of coins user wants to buy
    let wallet;

    // 1️⃣ Logged-in user (token available)
    if (req.user && req.user._id) {
      wallet = await Wallet.findOne({ userId: req.user._id });
      if (!wallet) {
        return res.status(404).json({ success: false, message: "Wallet not found for logged-in user" });
      }
    }
    // 2️⃣ Guest user (walletId must be passed)
    else {
      if (!walletId) {
        return res.status(400).json({ success: false, message: "Wallet ID is required for guest purchase" });
      }
      wallet = await Wallet.findById(walletId);
      if (!wallet) {
        return res.status(404).json({ success: false, message: "Wallet not found for guest user" });
      }
    }

    // 3️⃣ Calculate amount spent (with 5% surcharge for guests)
    let amountSpent = coins;
    if (wallet.isGuest) {
      amountSpent = parseFloat((coins * 1.05).toFixed(2)); // 5% extra cost for guests
    }

    // 4️⃣ Add coins to wallet
    wallet.totalCoin += coins;
    await wallet.save();

    // 5️⃣ Record transaction
    const transaction = await Transaction.create({
      userId: req.user ? req.user._id : null, // null for guest
      transactionType: "buyCoin",
      toWallet: wallet._id,
      coin: coins, // ✅ number of coins bought
      amount: amountSpent, // ✅ money spent
    });

    res.status(200).json({
      success: true,
      message: "Coins purchased successfully",
      coinsAdded: coins,
      amountSpent,
      wallet,
      transaction,
    });

  } catch (error) {
    console.error("Buy coin error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const sellCoins = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please login to sell coins" });
    }

    const { accountNumber, coins } = req.body;

    if (!accountNumber) {
      return res.status(400).json({ success: false, message: "Account number is required" });
    }

    if (!coins) {
      return res.status(400).json({ success: false, message: "Number of coins to sell is required" });
    }

    // Find wallet by userId only (ignoring accountNumber)
    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found for this user" });
    }

    if (wallet.totalCoin < coins) {
      return res.status(400).json({ success: false, message: "Insufficient coins to sell" });
    }

    // You can optionally verify accountNumber matches wallet.accountNumber here if needed
    // e.g. if (wallet.accountNumber !== accountNumber) { ... }

    // Deduct coins from wallet
    wallet.totalCoin -= coins;
    await wallet.save();

    // Record transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      transactionType: "sellCoin",
      fromWallet: wallet._id,
      coin: coins,
      amount: coins,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Coins sold successfully",
      coinsSold: coins,
      amountReceived: coins,
      wallet,
      transaction,
    });

  } catch (error) {
    console.error("Sell coins error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const transferCoins = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized: Please login to transfer coins" });
    }

    const { toWalletId, coins, redeemCode } = req.body;

    if (!toWalletId || !coins || !redeemCode) {
      return res.status(400).json({ success: false, message: "toWalletId, coins, and redeemCode are required" });
    }

    // Sender's personal wallet
    const fromWallet = await Wallet.findOne({ userId: req.user._id, walletType: 'personal' });
    if (!fromWallet) {
      return res.status(404).json({ success: false, message: "Sender personal wallet not found" });
    }

    if (fromWallet.totalCoin < coins) {
      return res.status(400).json({ success: false, message: "Insufficient coins to transfer" });
    }

    // Recipient's wallet using wallet ID
    const toWallet = await Wallet.findById(toWalletId);
    if (!toWallet) {
      return res.status(404).json({ success: false, message: "Recipient wallet not found" });
    }

    // Transfer coins
    fromWallet.totalCoin -= coins;
    toWallet.totalCoin += coins;

    await fromWallet.save();
    await toWallet.save();

    // Save redeem code in sender wallet
    const redeemIndex = Object.keys(fromWallet.redeemCode || {}).length.toString();
    fromWallet.redeemCode.set(redeemIndex, redeemCode);
    fromWallet.usedCode.set(redeemIndex, redeemCode);
    await fromWallet.save();

    // Record transaction
    const transaction = await Transaction.create({
      userId: req.user._id,
      transactionType: "TPWallet",
      fromWallet: fromWallet._id,
      toWallet: toWallet._id,
      redeemCode,
      coin: coins,
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Coins transferred successfully",
      coinsTransferred: coins,
      fromWallet,
      toWallet,
      transaction,
    });

  } catch (error) {
    console.error("Transfer coins error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
export const createLoyaltyCard = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to create loyalty card"
      });
    }

    const { codeValue, expiry } = req.body;

    if (codeValue == null) {
      return res.status(400).json({
        success: false,
        message: "codeValue is required"
      });
    }

    if (expiry == null || typeof expiry !== "number" || expiry <= 0) {
      return res.status(400).json({
        success: false,
        message: "expiry (in months) is required and must be a positive number"
      });
    }

    // Calculate expiryDate
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + expiry);

    // Find user's personal wallet
    const wallet = await Wallet.findOne({
      userId: req.user._id,
      walletType: "personal"
    });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for user"
      });
    }

    if (wallet.totalCoin < codeValue) {
      return res.status(400).json({
        success: false,
        message: "Insufficient coins in wallet"
      });
    }

    // Deduct coins
    wallet.totalCoin -= codeValue;
    await wallet.save();

    // Generate a single loyalty code (string)
    const loyaltyCode = generateCode(8); // e.g. "AB12CD34"

    // Create loyalty card
    const loyaltyCard = await LoyaltyCard.create({
      walletId: wallet._id,
      userId: req.user._id,
      codeValue,
      isPrivateUse: true,
      loyaltyCode, // plain string
      isCodeUsed: false,
      expiryDate
    });

    // Create transaction
    const transaction = await Transaction.create({
      transactionType: "buyLoyaltyCard",
      fromWallet: wallet._id,
      userId: req.user._id,
      toLoyaltyCard: loyaltyCard._id,
      coin: codeValue,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Loyalty card created successfully and coins deducted",
      loyaltyCard,
      transaction
    });
  } catch (error) {
    console.error("Create loyalty card error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const redeemLoyaltyCard = async (req, res) => {
  try {
    // 1. Auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to redeem loyalty card"
      });
    }

    const { loyaltyCode } = req.body;

    if (!loyaltyCode) {
      return res.status(400).json({
        success: false,
        message: "loyaltyCode is required"
      });
    }

    // 2. Find loyalty card by code
    const loyaltyCard = await LoyaltyCard.findOne({ loyaltyCode });
    if (!loyaltyCard) {
      return res.status(404).json({
        success: false,
        message: "Invalid loyalty code"
      });
    }

    // 3. Private/public redemption rules
    if (loyaltyCard.isPrivateUse) {
      if (loyaltyCard.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "This loyalty card is private and can only be redeemed by its creator"
        });
      }
    } else {
      if (loyaltyCard.userId.toString() === req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "This public loyalty card cannot be redeemed by its creator"
        });
      }
    }

    // 4. Check if already used
    if (loyaltyCard.isCodeUsed) {
      return res.status(400).json({
        success: false,
        message: "This loyalty code has already been used"
      });
    }

    // 5. Check expiry
    if (loyaltyCard.expiryDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This loyalty code has expired"
      });
    }

    // 6. Find user's personal wallet
    const wallet = await Wallet.findOne({
      userId: req.user._id,
      walletType: "personal"
    });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for user"
      });
    }

    // 7. Add coins to wallet
    wallet.totalCoin += loyaltyCard.codeValue;
    await wallet.save();

    // 8. Mark loyalty card as used
    loyaltyCard.isCodeUsed = true;
    await loyaltyCard.save();

    // 9. Create redeem transaction (fromLoyaltyCard → toWallet)
    const transaction = await Transaction.create({
      transactionType: "redeemLoyaltyCard",
      fromLoyaltyCard: loyaltyCard._id, // coins came from this loyalty card
      toWallet: wallet._id,             // coins go to this wallet
      userId: req.user._id,
      coin: loyaltyCard.codeValue,
      createdAt: new Date()
    });

    // 10. Return success
    res.status(200).json({
      success: true,
      message: "Loyalty card redeemed successfully, coins credited back",
      wallet,
      transaction
    });

  } catch (error) {
    console.error("Redeem loyalty card error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const generateWalletApiKey = catchAsync(async (req, res) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Please log in'
    });
  }

  // Find user's wallet
  const wallet = await Wallet.findOne({ userId: req.user._id });
  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: 'Wallet not found for user'
    });
  }

  // Generate new API key
  const newApiKey = crypto.randomBytes(32).toString('hex');

  wallet.apiKey = newApiKey;
  await wallet.save();

  res.status(200).json({
    success: true,
    message: 'API key generated successfully',
    apiKey: newApiKey
  });
});



export const transferCoinsWithApiKey = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']; // Receiver wallet API key
    const { coins, redeemCode } = req.body;  // Redeem code from sender wallet

    // 1. Basic validation
    if (!apiKey || !coins || !redeemCode) {
      return res.status(400).json({
        success: false,
        message: "apiKey, coins and redeemCode are required"
      });
    }

    // 2. Find receiver wallet by apiKey
    const receiverWallet = await Wallet.findOne({ apiKey });
    if (!receiverWallet) {
      return res.status(404).json({
        success: false,
        message: "Receiver wallet not found for apiKey"
      });
    }

    // 3. Find sender wallet by redeemCode (handles Maps & plain objects)
    const allWallets = await Wallet.find();
    const senderWallet = allWallets.find(wallet => {
      const codes = wallet.redeemCode instanceof Map
        ? Array.from(wallet.redeemCode.values())
        : Object.values(wallet.redeemCode || {});

      return codes.some(code =>
        typeof code === "string" &&
        code.trim().toUpperCase() === redeemCode.trim().toUpperCase()
      );
    });

    if (!senderWallet) {
      return res.status(404).json({
        success: false,
        message: "Sender wallet not found for redeem code"
      });
    }

    // 4. Check sender's coin balance
    if (senderWallet.totalCoin < coins) {
      return res.status(400).json({
        success: false,
        message: "Insufficient coins"
      });
    }

    // 5. Transfer coins
    senderWallet.totalCoin -= coins;
    receiverWallet.totalCoin += coins;

    // Move used redeem code to usedCode (works for Map and plain object)
    if (senderWallet.redeemCode instanceof Map) {
      for (let [key, code] of senderWallet.redeemCode.entries()) {
        if (code.trim().toUpperCase() === redeemCode.trim().toUpperCase()) {
          if (!senderWallet.usedCode) senderWallet.usedCode = new Map();
          senderWallet.usedCode.set(key, code);
          senderWallet.redeemCode.delete(key);
          senderWallet.markModified('redeemCode');
          senderWallet.markModified('usedCode');
          break;
        }
      }
    } else {
      for (let key in senderWallet.redeemCode) {
        if (senderWallet.redeemCode[key].trim().toUpperCase() === redeemCode.trim().toUpperCase()) {
          if (!senderWallet.usedCode) senderWallet.usedCode = {};
          senderWallet.usedCode[key] = senderWallet.redeemCode[key];
          delete senderWallet.redeemCode[key];
          senderWallet.markModified('redeemCode');
          senderWallet.markModified('usedCode');
          break;
        }
      }
    }

    // 6. Save wallets
    await senderWallet.save();
    await receiverWallet.save();

    // 7. Record the transaction
    await Transaction.create({
      userId: senderWallet.userId,
      transactionType: "TPWallet",
      fromWallet: senderWallet._id,
      toWallet: receiverWallet._id,
      redeemCode,
      coin: coins,
      createdAt: new Date(),
    });

    // 8. Send success response
    res.json({
      success: true,
      message: "Coins transferred successfully",
      senderWallet: {
        userId: senderWallet.userId,
        totalCoin: senderWallet.totalCoin
      },
      receiverWallet: {
        userId: receiverWallet.userId,
        totalCoin: receiverWallet.totalCoin
      }
    });

  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getWalletDetails = async (req, res) => {
  try {
    // 1. Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to view wallet"
      });
    }

    // 2. Find wallet by logged-in user ID
    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user"
      });
    }

    // 3. Send wallet details
    res.json({
      success: true,
      wallet: {
        walletId: wallet._id,
        walletName: wallet.walletName,
        userId: wallet.userId,
        totalCoin: wallet.totalCoin,
        walletType: wallet.walletType,
        professionalWallet: wallet.professionalWallet,
        redeemCode: wallet.redeemCode,
        usedCode: wallet.usedCode,
        apiKey: wallet.apiKey
      }
    });

  } catch (error) {
    console.error("Get wallet error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getWalletTransactions = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to view transactions"
      });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user"
      });
    }

    // Fetch all transaction details for that wallet
    const transactions = await Transaction.find({
      $or: [
        { toWallet: wallet._id },
        { fromWallet: wallet._id }
      ]
    })
      .sort({ createdAt: -1 });  // latest first

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error("Get wallet transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



export const fetchKycDetails = catchAsync(async (req, res) => {
  const { userId } = req.body; // or query parameter if you prefer

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "userId is required in request body",
    });
  }

  const user = await User.findById(userId).select('username email isKycVerified kyc_details');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Fetched KYC details',
    data: user,
  });
});



export const getUserLoyaltyCards = async (req, res) => {
  try {
    // 1. Check if user is logged in
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to view loyalty cards"
      });
    }

    // 2. Fetch only unused loyalty cards for this user
    const loyaltyCards = await LoyaltyCard.find({
      userId: req.user._id,
      isUsed: false
    }).sort({ createdAt: -1 }); // latest first

    // 3. If no unused cards exist
    if (!loyaltyCards || loyaltyCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No unused loyalty codes found for this user"
      });
    }

    // 4. Respond with loyalty codes and card details
    res.status(200).json({
      success: true,
      message: "Unused loyalty codes fetched successfully",
      loyaltyCodes: loyaltyCards.map(card => ({
        code: card.code,
        createdAt: card.createdAt
      }))
    });

  } catch (error) {
    console.error("Fetch unused loyalty cards error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



export const getWalletCodes = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to view codes"
      });
    }

    // 🔹 find wallet for this logged in user
    const wallet = await Wallet.findOne({ userId: req.user._id }).lean();
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user"
      });
    }

    // ✅ return only arrays of codes
    const redeemCodes = Object.values(wallet.redeemCode || {});
    const usedCodes   = Object.values(wallet.usedCode || {});

    res.json({
      success: true,
      redeemCodes,
      usedCodes
    });

  } catch (error) {
    console.error("Get wallet codes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const getCurrentUserDetails = catchAsync(async (req, res) => {
  // req.user is set by protect middleware
  const user = await User.findById(req.user._id).select("username bio followers following");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    user: {
      username: user.username,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      followersCount: user.followers.length,
      followingCount: user.following.length
    }
  });
});

//ROUTES FOR ORIGNAL LOGIN
export const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No user found'
    });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  const token = await user.generateAuthToken();

  res.json({
    success: true,
    message: 'Login successful',
    token,
    userId: user._id
  });
});


// ;export const verifyOrder = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

//     if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//       return res.status(400).json({ success: false, message: "All payment details are required" });
//     }

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({ success: false, message: "Payment verification failed" });
//     }

//     // update payment
//     const payment = await Payment.findOne({ orderId: razorpay_order_id });
//     if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

//     payment.paymentId = razorpay_payment_id;
//     payment.signature = razorpay_signature;
//     payment.status = "success";
//     await payment.save();

//     // update order
//     const order = await Order.findOne({ payment: payment._id });
//     if (order) {
//       order.status = "paid";
//       await order.save();
//     }

//     res.json({
//       success: true,
//       message: "Payment verified successfully",
//       paymentId: razorpay_payment_id,
//       orderId: razorpay_order_id,
//       guest: payment.userId ? false : true, // tells if it was guest
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// }



// export const createOrder = async (req, res) => {
//   try {
//     const { products, guest } = req.body;

//     if (!products || products.length === 0) {
//       return res.status(400).json({ success: false, message: "Products are required" });
//     }

//     // calculate total amount
//     const totalAmount = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

//     // create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: totalAmount * 100, // paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//     });

//     // 🟢 If logged-in user available
//     const userId = req.user ? req.user._id : null;

//     // Save order in DB
//     const order = await Order.create({
//       userId,              // null if guest
//       products,
//       totalAmount,
//       status: "pending",
//     });

//     // Save payment info
//     const payment = await Payment.create({
//       userId,              // null if guest
//       orderId: razorpayOrder.id,
//       amount: totalAmount,
//       currency: "INR",
//       status: "created",
//       description: guest ? "Guest Checkout" : "User Checkout",
//     });

//     order.payment = payment._id;
//     await order.save();

//     res.json({
//       success: true,
//       key: process.env.RAZORPAY_KEY_ID, // needed on frontend
//       orderId: razorpayOrder.id,
//       amount: totalAmount,
//       currency: "INR",
//       guest: !userId, // tells frontend whether it was guest checkout
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// import axios from "axios";
// import Payment from "../models/paymentModel.js"; // adjust path as per your project

export const createOrder = catchAsync(async (req, res) => {
  const { amount, currency, phone } = req.body;

  // Basic validation
  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }
  if (!phone || phone.trim() === "") {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  const userId = req.user._id;
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  if (!user.email || user.email.trim() === "") {
    return res.status(400).json({ success: false, message: "User must have a valid email" });
  }

  try {
    // Generate a unique order ID
    const orderId = "order_" + Date.now();

    // Create order in Cashfree
    const response = await axios.post(
      "https://api.cashfree.com/pg/orders",
      {
        order_id: orderId,
        order_amount: amount,
        order_currency: currency || "INR",
        customer_details: {
          customer_id: user._id.toString(),
          customer_email: user.email,
          customer_phone: phone,
        },
        order_meta: {
          return_url: "https://api.thoverpay.com/api/auth/payment/return",
          notify_url: "https://api.thoverpay.com/api/auth/cashfree-webhook",
        },
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    // Store order in your DB
    const payment = await Payment.create({
      orderId: orderId, // same as Cashfree
      userId: user._id,
      amount: Number(amount),
      currency: currency || "INR",
      status: "PENDING",
      phone: phone,
      customerEmail: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: response.data,
      db: payment,
    });
  } catch (error) {
    console.error("Cashfree order error:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.response?.data || error.message,
    });
  }
});





export const cashfreeWebhook = async (req, res) => {
  try {
    const data = req.body;
    const signature = req.headers["x-webhook-signature"]; // Cashfree HMAC

    // Compute signature
    const computedSignature = crypto
      .createHmac("sha256", process.env.CASHFREE_WEBHOOK_SECRET)
      .update(JSON.stringify(data))
      .digest("base64"); // Make sure format matches Cashfree

    if (signature !== computedSignature) {
      console.log("❌ Invalid signature");
      return res.status(401).json({ success: false, message: "Invalid signature" });
    }

    console.log("✅ Webhook received:", data);

    // Extract payment info
    const { orderId, referenceId, orderAmount, orderStatus, paymentMode } = data;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Missing orderId" });
    }

    // Update DB
    const updated = await Payment.findOneAndUpdate(
      { orderId: orderId },
      {
        status: orderStatus,
        referenceId: referenceId,
        paymentMode: paymentMode,
        amount: orderAmount,
        updatedAt: new Date(),
      },
      { new: true } // return updated document
    );

    if (!updated) {
      console.log(`❌ Order not found: ${orderId}`);
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    console.log("✅ Payment updated:", updated);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const handleReturn = catchAsync(async (req, res) => {
  const { order_id, reference_id, tx_status, order_amount, order_currency } = req.query;

  if (!order_id) {
    return res.status(400).json({
      success: false,
      message: "Invalid request: order_id is missing",
    });
  }

  const payment = await Payment.findOne({ orderId: order_id });
  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment record not found",
    });
  }

  // Update payment status based on Cashfree response
  if (tx_status === "SUCCESS") {
    payment.status = "SUCCESS";
  } else {
    payment.status = "FAILED";
  }

  await payment.save();

  res.json({
    success: true,
    message: `Payment ${payment.status}`,
    data: {
      orderId: order_id,
      referenceId: reference_id,
      status: payment.status,
      amount: order_amount,
      currency: order_currency,
    },
  });
});

