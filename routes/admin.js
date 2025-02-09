const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const Booking = require("../models/booking");
const Contact = require("../models/Contact");

const router = express.Router();

router.get("/admin-data", authMiddleware(["admin"]), async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const bookings = await Booking.find().populate("room");
    const contacts = await Contact.find();

    res.status(200).json({ users, bookings, contacts });
  } catch (error) {
    console.error("Error fetching admin data:", error.message);
    res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
