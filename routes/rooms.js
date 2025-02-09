const express = require("express");
const {
  createRooms,
  getAllRooms,
  getRoomById, // Add this import
  updateRoom,
  deleteRoom,
  getAvailableRooms,
} = require("../controllers/rooms");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-rooms", createRooms);

router.get("/get-rooms/:roomId", getRoomById); // Add this route to get a room by its ID

router.delete("/del-rooms/:roomId", deleteRoom);
router.get("/get-rooms", getAllRooms); // Add this route for fetching all rooms

// In rooms.js route file
router.put("/update-rooms/:roomId", updateRoom); // Ensure this route is correct for updating rooms
router.get(
  "/get-available-rooms",
  authMiddleware(["client", "admin"]),
  getAvailableRooms
);
// Ensure this matches the frontend route

module.exports = router;
