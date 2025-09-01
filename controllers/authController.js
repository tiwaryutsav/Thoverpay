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
import Payment from "../models/Payment.js";    // ✅ Payment model
// import Order from "../models/Order.js";
import Kyc from "../models/kyc.js"; // adjust path

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
export const login = catchAsync(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email/Username and password are required'
    });
  }

  // Build query dynamically
  let query = {};
  if (email) {
    query.email = email;
  } else if (username) {
    query.username = username;
  }

  const user = await User.findOne(query).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'No user found with that email/username'
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

    const isLoggedIn = !!req.user;

    // ✅ If logged-in → only 1 wallet allowed
    if (isLoggedIn) {
      let existingWallet = await Wallet.findOne({ userId: req.user._id });

      if (existingWallet) {
        return res.status(200).json({
          success: true,
          message: "Wallet already exists",
          data: existingWallet
        });
      }

      // create wallet for logged-in user
      const wallet = new Wallet({
        walletName,
        userId: req.user._id,
        isGuest: false,
        walletType: "personal",
        professionalWallet: false,
        totalCoin: 49,
        redeemCode: {}
      });

      for (let i = 0; i < 5; i++) {
        wallet.redeemCode.set(i.toString(), generateRandomCode());
      }

      await wallet.save();

      return res.status(201).json({
        success: true,
        message: "Wallet created with 5 codes and 49 coins",
        data: wallet
      });
    }

    // ✅ If guest → multiple wallets allowed (unique walletName)
    let guestWallet = await Wallet.findOne({ isGuest: true, walletName });
    if (guestWallet) {
      return res.status(400).json({
        success: false,
        message: "Guest wallet with this name already exists",
        data: guestWallet
      });
    }

    // create new guest wallet
    const wallet = new Wallet({
      walletName,
      userId: null,
      isGuest: true,
      walletType: "personal",
      professionalWallet: false,
      totalCoin: 49,
      redeemCode: {}
    });

    wallet.redeemCode.set("0", generateRandomCode());

    await wallet.save();

    return res.status(201).json({
      success: true,
      message: "Guest wallet created with 1 code and 49 coins",
      data: wallet
    });

  } catch (error) {
    console.error("Create wallet error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




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

    // Prevent transferring to own wallet
    if (fromWallet._id.toString() === toWalletId) {
      return res.status(400).json({ success: false, message: "Cannot transfer coins to your own wallet" });
    }

    // Recipient's wallet
    const toWallet = await Wallet.findById(toWalletId);
    if (!toWallet) {
      return res.status(404).json({ success: false, message: "Recipient wallet not found" });
    }

    // Transfer coins
    fromWallet.totalCoin -= coins;
    toWallet.totalCoin += coins;

    // Handle redeem codes
    if (fromWallet.redeemCode) {
      for (const [key, value] of fromWallet.redeemCode.entries()) {
        if (value === redeemCode) {
          fromWallet.redeemCode.delete(key);
          break;
        }
      }
    }

    const usedIndex = Object.keys(fromWallet.usedCode || {}).length.toString();
    fromWallet.usedCode.set(usedIndex, redeemCode);

    await fromWallet.save();
    await toWallet.save();

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
        message: "Unauthorized: Please login to create loyalty code"
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

    // Create loyalty code entry
    const loyaltyCard = await LoyaltyCard.create({
      walletId: wallet._id,
      userId: req.user._id,
      codeValue,
      isPrivateUse: true,
      loyaltyCode, // plain string
      isCodeUsed: false,
      expiryDate
    });

    // Create transaction (notice the changes here 👇)
    const transaction = await Transaction.create({
      transactionType: "buyLoyaltyCode", // ✅ updated enum value
      fromWallet: wallet._id,
      userId: req.user._id,
      toLoyaltyCode: loyaltyCode,        // ✅ store the code, not card ref
      coin: codeValue,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "Loyalty code created successfully and coins deducted",
      loyaltyCard,
      transaction
    });
  } catch (error) {
    console.error("Create loyalty code error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const redeemLoyaltyCode = async (req, res) => {
  try {
    // 1. Auth check
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to redeem loyalty code"
      });
    }

    const { loyaltyCode } = req.body;

    if (!loyaltyCode) {
      return res.status(400).json({
        success: false,
        message: "loyaltyCode is required"
      });
    }

    // 2. Find loyalty code entry
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
          message: "This loyalty code is private and can only be redeemed by its creator"
        });
      }
    } else {
      if (loyaltyCard.userId.toString() === req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "This public loyalty code cannot be redeemed by its creator"
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

    // 8. Mark loyalty code as used
    loyaltyCard.isCodeUsed = true;
    await loyaltyCard.save();

    // 9. Create redeem transaction (fromLoyaltyCode → toWallet)
    const transaction = await Transaction.create({
      transactionType: "redeemLoyaltyCode", // ✅ updated enum
      fromLoyaltyCode: loyaltyCode,         // ✅ store string instead of ObjectId
      toWallet: wallet._id,                 
      userId: req.user._id,
      coin: loyaltyCard.codeValue,
      createdAt: new Date()
    });

    // 10. Return success
    res.status(200).json({
      success: true,
      message: "Loyalty code redeemed successfully, coins credited back",
      wallet,
      transaction
    });

  } catch (error) {
    console.error("Redeem loyalty code error:", error);
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
        message: "Unauthorized: Please login to view transactions",
      });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user",
      });
    }

    // ✅ Fetch all transactions where this user's wallet is involved
    const transactions = await Transaction.find({
      $or: [{ fromWallet: wallet._id }, { toWallet: wallet._id }],
    })
      .populate("fromWallet", "userId")  // show which user sent
      .populate("toWallet", "userId")    // show which user received
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get wallet transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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


export const fetchAllLoyaltyCards = async (req, res) => {
  try {
    const userId = req.user._id;

    const loyaltyCards = await LoyaltyCard.find({ userId });

    if (!loyaltyCards || loyaltyCards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No loyalty cards found for this user"
      });
    }

    res.status(200).json({
      success: true,
      message: "All loyalty cards fetched successfully",
      loyaltyCards // 🔹 returns all card details
    });
  } catch (error) {
    console.error("Error fetching loyalty cards:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
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




// ✅ Step 1: Create Cashfree Order
export const createOrder = catchAsync(async (req, res) => {
  const { amount, currency, phone } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "User not logged in" });
  }

  if (!amount) {
    return res.status(400).json({ success: false, message: "Amount is required" });
  }

  if (!phone || phone.trim() === "") {
    return res.status(400).json({ success: false, message: "Phone number is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const cashfreeUrl = `${process.env.CASHFREE_API_URL}/orders`;

    // ✅ Payload without custom order_id (Cashfree will generate it)
    const orderPayload = {
      order_amount: amount,
      order_currency: currency || "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_email: user.email || "test@example.com",
        customer_phone: phone,
        customer_name: user.name || "Customer",
      },
      order_meta: {
        return_url: "myapp://payment-success", // mobile deep link
      },
    };

    const cashfreeResponse = await axios.post(cashfreeUrl, orderPayload, {
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const data = cashfreeResponse.data;

    // ✅ Save PENDING order in DB
    await Payment.create({
      orderId: data.order_id,  // From Cashfree
      amount,
      currency: currency || "INR",
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      message: "Order created successfully",
      data: {
        order_id: data.order_id,
        payment_session_id: data.payment_session_id,
      },
    });
  } catch (error) {
    console.error("Error creating Cashfree order:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.response?.data || error.message,
    });
  }
});

// ✅ Step 2: Verify Payment (Webhook or frontend callback)
export const verifyPayment = catchAsync(async (req, res) => {
  try {
    const { orderId } = req.body; // frontend sends order_id after success

    const cashfreeUrl = `${process.env.CASHFREE_API_URL}/orders/${orderId}/payments`;

    const response = await axios.get(cashfreeUrl, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
        "x-api-version": "2022-09-01",
      },
    });

    const paymentData = response.data[0]; // latest payment attempt

    // ✅ Update DB with actual payment status
    await Payment.findOneAndUpdate(
      { orderId },
      {
        status: paymentData.payment_status,
        referenceId: paymentData.cf_payment_id, // Cashfree Payment ID
        paymentMode: paymentData.payment_group,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: paymentData,
    });
  } catch (error) {
    console.error("Error verifying payment:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.response?.data || error.message,
    });
  }
});




export const setAccountInfoAndKyc = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const {
    professionType,
    profession,
    businessName,
    ownerName,
    panNumber,
    panUrl,
  } = req.body;

  let kyc = await Kyc.findOne({ user: userId });

  if (!kyc) {
    kyc = new Kyc({ user: userId });
  }

  if (professionType !== undefined) kyc.professionType = professionType;
  if (profession !== undefined) kyc.profession = profession;

  if (businessName && ownerName && panNumber && panUrl) {
    kyc.kycStatus = "pending";
    kyc.isKycVerified = false;
    kyc.ownerName = ownerName;
    kyc.businessName = businessName;
    kyc.panNumber = panNumber;
    kyc.panUrl = panUrl;
  }

  await kyc.save();

  res.status(200).json({
    success: true,
    message: "Account info and KYC details updated successfully.",
    kyc,
  });
});








// 🔹 Admin takes coins from any user wallet
export const adminTakeCoins = async (req, res) => {
  try {
    const { walletName, coins } = req.body;

    // ✅ check admin by isAdmin flag
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access only",
      });
    }

    // ✅ find the user's wallet
    const userWallet = await Wallet.findOne({ walletName });
    if (!userWallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user",
      });
    }

    // ✅ check balance
    if (userWallet.totalCoin < coins) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance in user wallet",
      });
    }

    // ✅ deduct coins from user
    userWallet.totalCoin -= coins;
    await userWallet.save();

    // ✅ find admin's wallet
    const adminWallet = await Wallet.findOne({ userId: req.user._id });
    if (!adminWallet) {
      return res.status(404).json({
        success: false,
        message: "Admin wallet not found",
      });
    }

    // ✅ add coins to admin
    adminWallet.totalCoin += coins;
    await adminWallet.save();

    // ✅ log transaction for user (sentCoin)
    await Transaction.create({
      transactionType: "sentCoin",
      userId: userWallet.userId,
      coin: coins,
      fromWallet: userWallet._id,
      toWallet: adminWallet._id,
    });

    // ✅ log transaction for admin (gotCoin)
    await Transaction.create({
      transactionType: "gotCoin",
      userId: req.user._id,
      coin: coins,
      fromWallet: userWallet._id,
      toWallet: adminWallet._id,
    });

    res.json({
      success: true,
      message: `Successfully transferred ${coins} coins from "${walletName}" to admin`,
    });
  } catch (error) {
    console.error("Admin take coins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 🔹 Admin gives coins to any user wallet
// 🔹 Admin gives coins to any user wallet
export const adminGiveCoins = async (req, res) => {
  try {
    const { walletName, coins } = req.body;

    // ✅ Validate input
    if (!walletName || !coins || coins <= 0) {
      return res.status(400).json({
        success: false,
        message: "Wallet name and positive coin amount are required",
      });
    }

    // ✅ check admin by isAdmin flag
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access only",
      });
    }

    // ✅ find the user's wallet
    const userWallet = await Wallet.findOne({ walletName });
    if (!userWallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user",
      });
    }

    // ✅ find admin's wallet
    const adminWallet = await Wallet.findOne({ userId: req.user._id });
    if (!adminWallet) {
      return res.status(404).json({
        success: false,
        message: "Admin wallet not found",
      });
    }

    // ✅ check if admin has enough coins
    if (adminWallet.totalCoin < coins) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance in admin wallet",
      });
    }

    // ✅ perform transfer
    adminWallet.totalCoin -= coins;
    userWallet.totalCoin += coins;

    // ✅ save both wallets in parallel
    await Promise.all([adminWallet.save(), userWallet.save()]);

    // ✅ log transactions (await both to ensure saved)
    const [sentTx, gotTx] = await Promise.all([
      Transaction.create({
        transactionType: "sentCoin",
        userId: req.user._id,       // admin ID
        coin: coins,
        fromWallet: adminWallet._id,
        toWallet: userWallet._id,
      }),
      Transaction.create({
        transactionType: "gotCoin",
        userId: userWallet.userId,  // user ID
        coin: coins,
        fromWallet: adminWallet._id,
        toWallet: userWallet._id,
      }),
    ]);

    console.log("✅ Sent transaction:", sentTx._id);
    console.log("✅ Got transaction:", gotTx._id);

    res.json({
      success: true,
      message: `Successfully transferred ${coins} coins from admin to "${walletName}"`,
      data: { sentTx, gotTx },
    });
  } catch (error) {
    console.error("Admin give coins error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


export const getMyKycDetails = catchAsync(async (req, res) => {
  const userId = req.user._id; // logged-in user

  // ✅ Find the KYC record
  const kycRecord = await Kyc.findOne({ user: userId }).select("-__v -updatedAt");

  if (!kycRecord) {
    return res.status(404).json({
      success: false,
      message: "No KYC record found for this user",
    });
  }

  // ✅ Find the user (to get accountType from User model)
  const user = await User.findById(userId).select("accountType username email");

  // ✅ Return details
  res.status(200).json({
    success: true,
    data: {
      userId: kycRecord.user,
      username: user?.username,
      email: user?.email,
      accountType: user?.accountType || "Personal", // from User model
      isKycVerified: kycRecord.isKycVerified,
      kycStatus: kycRecord.kycStatus,
      ownerName: kycRecord.ownerName,
      businessName: kycRecord.businessName,
      panNumber: kycRecord.panNumber,
      panUrl: kycRecord.panUrl,
      professionType: kycRecord.professionType,
      profession: kycRecord.profession,
      createdAt: kycRecord.createdAt,
    },
  });
});



export const createWalletForUser = catchAsync(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User must be logged in to create a wallet",
    });
  }

  // ✅ Check if user already has a wallet
  const existingWallet = await Wallet.findOne({ userId: user._id });
  if (existingWallet) {
    return res.status(200).json({
      success: true,
      message: "Wallet already exists for this user",
      data: existingWallet,
    });
  }

  // ✅ Generate wallet name: username + random numbers
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // 4 digits
  const walletName = `${user.username}${randomNumber}`;

  // ✅ Determine wallet type based on user account type
  const isProfessional = user.accountType === "Professional";

  // ✅ Create new wallet
  const wallet = new Wallet({
    walletName,
    userId: user._id,
    isGuest: false,
    walletType: isProfessional ? "professional" : "personal",
    professionalWallet: isProfessional,
    totalCoin: 49,
    redeemCode: {},
  });

  // Generate 5 redeem codes automatically
  for (let i = 0; i < 5; i++) {
    wallet.redeemCode.set(i.toString(), generateRandomCode());
  }

  await wallet.save();

  return res.status(201).json({
    success: true,
    message: `Wallet created successfully as ${
      isProfessional ? "Professional" : "Personal"
    } with 49 coins and 5 redeem codes`,
    data: wallet,
  });
});

export const checkAndRegenerateRedeemCodes = catchAsync(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User must be logged in",
    });
  }

  const wallet = await Wallet.findOne({ userId: user._id });

  if (!wallet) {
    return res.status(404).json({
      success: false,
      message: "Wallet not found for this user",
    });
  }

  // ✅ Count unused redeem codes
  const allCodes = Array.from(wallet.redeemCode.values());
  const usedCodes = new Set(wallet.usedCode ? wallet.usedCode.values() : []);
  const unusedCodes = allCodes.filter(code => !usedCodes.has(code));

  if (unusedCodes.length < 3) {
    // Add 5 new codes
    const currentSize = wallet.redeemCode.size;
    for (let i = 0; i < 5; i++) {
      wallet.redeemCode.set((currentSize + i).toString(), generateRandomCode());
    }
    await wallet.save();
  }

  return res.status(200).json({
    success: true,
    message:
      unusedCodes.length < 3
        ? "Less than 3 unused codes. Added 5 new redeem codes."
        : "Sufficient unused redeem codes. No new codes added.",
    data: wallet,
  });
});



