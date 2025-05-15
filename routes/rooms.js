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

router.get("/get-rooms/:roomId", getRoomById);
router.delete("/del-rooms/:roomId", deleteRoom);
router.get("/get-rooms", getAllRooms);

router.put("/update-rooms/:roomId", updateRoom);
router.get(
  "/get-available-rooms",
  authMiddleware(["client", "admin"]),
  getAvailableRooms
);

module.exports = router;
