const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../controllers/utils/email");
const mongoose = require("mongoose");
// Helper Functions
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isValidPhone = (phone) => {
  return phone && phone.length === 11 && /^03\d{9}$/.test(phone);
};

// Register User
const registerUser = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      role,
      phone,
      address,
    } = req.body;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !password ||
      !phone ||
      !address
    ) {
      return res.status(400).json({ msg: "All fields are required!" });
    }

    // Validate phone number
    if (!isValidPhone(phone)) {
      return res.status(400).json({
        msg: "Phone number must be 11 digits, start with '03', and contain only numeric characters!",
      });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ msg: "Email already exists, please use another!" });
    }

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ msg: "Username already taken, please choose another!" });
    }

    // Check for duplicate phone
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ msg: "Phone number already exists, please use another!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
    });

    // Save user
    await newUser.save();

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ msg: "Account created successfully", token });
  } catch (error) {
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ msg: errors[0] });
    }

    console.error("Registration Error:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ msg: "Email, password, and role are required!" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.role !== role) {
      return res.status(403).json({ msg: "Invalid role for this user" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid Email and Password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      msg: "Login successful",
      token,
      role: user.role,
      username: user.username,
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// Forget Password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ msg: "User not found!" });
    }

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendResetPasswordEmail(email, resetToken);
    res.status(200).json({ msg: "Reset link sent to your email." });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};
// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    console.log("Incoming Token:", token);
    console.log("New Password:", newPassword);

    // Check if JWT_SECRET is loaded
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded Token:", decoded);
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(400).json({ msg: "Invalid or expired token!" });
    }

    const query = {
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    };
    console.log("Find User Query:", query);

    const user = await User.findOne(query);
    console.log("User Found:", user);

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token!" });
    }

    console.log("New Password Before Hashing:", newPassword);

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    try {
      await user.save();
      console.log("Password Updated Successfully");
      res.status(200).json({ msg: "Password reset successfully!" });
    } catch (err) {
      console.error("Save Error:", err.message);
      return res
        .status(500)
        .json({ msg: "Error saving user data", error: err.message });
    }
  } catch (error) {
    console.error("General Error:", error.message);
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// Update User
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, username, email, phone, address } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ msg: "Invalid user ID" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { firstname, lastname, username, email, phone, address },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ msg: "User updated successfully", user });
  } catch (error) {
    console.error("Update User Error:", error.message);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

// View All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ msg: "No users found" });
    }

    res.status(200).json({ users });
  } catch (error) {
    console.error("Get All Users Error:", error.message);
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  deleteUser,
  updateUser,
  getAllUsers,
};
