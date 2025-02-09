const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin-data", authMiddleware(["admin"]), async (req, res) => {
  const users = await User.find();
  const bookings = await Booking.find().populate("user room");
  const contacts = await Contact.find();

  res.json({ users, bookings, contacts });
});

module.exports = router;
