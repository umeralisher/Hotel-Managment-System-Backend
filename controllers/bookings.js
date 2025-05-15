const Booking = require("../models/booking");
const Room = require("../models/Room");

const createBooking = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate, paymentStatus } = req.body;
    const userId = req.user.id;

    // Fetch room to get pricePerNight
    const selectedRoom = await Room.findById(room);
    if (!selectedRoom) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    // Calculate the number of nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date",
      });
    }

    // Calculate total amount
    const totalAmount = (selectedRoom.pricePerNight * nights).toFixed(2);

    // Create booking
    const newBooking = await Booking.create({
      user: userId,
      room,
      checkInDate,
      checkOutDate,
      totalAmount,
      paymentStatus,
      bookingStatus: "pending",
    });

    // Update room status
    await Room.findByIdAndUpdate(room, { status: "booked" });

    res.status(201).json({ success: true, data: newBooking });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to create booking", error });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "username email role")
      .populate("room", "roomNumber roomType");

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "username email")
      .populate("room", "roomNumber roomType");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to fetch booking", error });
  }
};

const updateBooking = async (req, res) => {
  try {
    const {
      room,
      checkInDate,
      checkOutDate,
      totalAmount,
      bookingStatus,
      paymentStatus,
    } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        room,
        checkInDate,
        checkOutDate,
        totalAmount,
        bookingStatus,
        paymentStatus,
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedBooking });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to update booking", error });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    await Room.findByIdAndUpdate(booking.room, { status: "available" });

    res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Unable to delete booking", error });
  }
};

module.exports = {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
};
