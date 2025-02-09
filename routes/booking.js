const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookings");

const router = express.Router();

router.get("/get-bookings", authMiddleware(["admin"]), getBookings);
router.get(
  "/get-booking/:id",
  authMiddleware(["admin", "client"]),
  getBookingById
);
router.post("/create-booking", authMiddleware(["client"]), createBooking);
router.put(
  "/update-booking/:id",
  authMiddleware(["admin", "client"]),
  updateBooking
);
router.delete("/delete-booking/:id", authMiddleware(["admin"]), deleteBooking);

module.exports = router;
