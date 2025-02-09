const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: [true, "First Name is required"],
    trim: true,
    minLength: [3, "First Name must be at least 3 characters"],
    maxLength: [20, "First Name must be less than 20 characters"],
  },
  lastname: {
    type: String,
    required: [true, "Last Name is required"],
    trim: true,
    minLength: [3, "Last Name must be at least 3 characters"],
    maxLength: [20, "Last Name must be less than 20 characters"],
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minLength: [3, "Username must be at least 3 characters"],
    maxLength: [20, "Username must be less than 20 characters"],
    unique: [true, "Username already exists"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["admin", "client"],
    default: "client",
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    unique: true,
    trim: true,
    maxLength: [13, "Phone number must be less than 13 characters"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordTokenExpiry: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
