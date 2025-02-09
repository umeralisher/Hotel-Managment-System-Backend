require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dBConnect = require("./db/dbconfig");

// Importing routes
const bookingRouter = require("./routes/booking");
const roomsRouter = require("./routes/rooms");
const userRouter = require("./routes/user");
const contactRouter = require("./routes/contact"); // Added contact route

const app = express();
const port = process.env.PORT || 8000;

// Connect to Database
dBConnect();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS for cross-origin requests

// Routes
app.use("/bookings", bookingRouter);
app.use("/rooms", roomsRouter);
app.use("/users", userRouter); // User-related routes
app.use("/contact", contactRouter); // Contact-related routes

// Default Route
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

// Error Handling
app.use((req, res, next) => {
  res.status(404).json({ msg: "Route not found" });
});
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.message);
  res.status(500).json({ msg: "Internal Server Error" });
});

// Start the Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Start the Server
