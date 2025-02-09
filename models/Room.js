const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: true,
    unique: true,
  },
  roomType: {
    type: String,
    enum: ["single", "double", "suite", "family"],
    required: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["available", "booked", "maintenance"],
    default: "available",
    lowercase: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
