require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dBConnect = require("./db/dbconfig");

// Importing routes
const bookingRouter = require("./routes/booking");
const roomsRouter = require("./routes/rooms");
const userRouter = require("./routes/user");
const contactRouter = require("./routes/contact");

const app = express();
const port = process.env.PORT || 8000;

// Connect to Database
dBConnect();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/bookings", bookingRouter);
app.use("/rooms", roomsRouter);
app.use("/users", userRouter);
app.use("/contact", contactRouter);

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
