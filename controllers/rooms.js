const Room = require("../models/Room");

const createRooms = async (req, res) => {
  try {
    const {
      roomNumber,
      roomType,
      description,
      pricePerNight,
      status,
      isActive,
      image,
    } = req.body;

    if (!roomNumber) {
      return res.status(400).json({
        msg: "Room Number is missing!",
      });
    }

    if (!roomType) {
      return res.status(400).json({
        msg: "Room Type is missing",
      });
    }

    if (!description) {
      return res.status(400).json({
        msg: "Description is missing!",
      });
    }

    if (!pricePerNight) {
      return res.status(400).json({
        msg: "PriceperNight is missing",
      });
    }

    if (!status) {
      return res.status(400).json({
        msg: "Status  is missing!",
      });
    }

    if (!image) {
      return res.status(400).json({
        msg: "Image is missing!",
      });
    }

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res
        .status(400)
        .json({ msg: "Room with this room number already exists." });
    }

    const imageRegex = /^data:image\/(png|jpg|jpeg);base64,/;
    if (!imageRegex.test(image)) {
      return res.status(400).json({
        msg: "Invalid image format. Please upload a valid PNG or JPG image.",
      });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const base64Data = image.split(",")[1];
    const imageSize = Buffer.from(base64Data, "base64").length;

    if (imageSize > maxSize) {
      return res.status(400).json({ msg: "Image size exceeds the 5MB limit." });
    }

    const newRoom = await Room.create({
      roomNumber,
      roomType,
      description,
      pricePerNight,
      status,
      isActive,
      image,
    });

    res.status(201).json({ msg: "Room created successfully!", room: newRoom });
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get all rooms

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Get a single room by its ID
const getRoomById = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ msg: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// Update a room by ID
const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const updatedData = req.body;

    const updatedRoom = await Room.findByIdAndUpdate(roomId, updatedData, {
      new: true,
    });

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json(updatedRoom); // Return updated room data
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Error updating room" });
  }
};

// Delete a room by ID
const deleteRoom = async (req, res) => {
  const { roomId } = req.params;
  try {
    const deletedRoom = await Room.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return res.status(404).json({ msg: "Room not found" });
    }

    res.status(200).json({ msg: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

const getAvailableRooms = async (req, res) => {
  try {
    const availableRooms = await Room.find({ status: "available" }).select(
      "roomNumber roomType"
    );
    res.status(200).json({ success: true, data: availableRooms });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch rooms" });
  }
};

module.exports = {
  createRooms,
  getAllRooms,
  getRoomById, // Export the new function
  updateRoom,
  deleteRoom,
  getAvailableRooms,
};
