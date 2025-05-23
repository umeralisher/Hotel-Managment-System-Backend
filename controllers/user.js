const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendResetPasswordEmail } = require("../controllers/utils/email");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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

    // Check required fields
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

    // Validate lengths
    if (firstname.length < 3) {
      return res
        .status(400)
        .json({ msg: "First name must be at least 3 characters long!" });
    }
    if (lastname.length < 3) {
      return res
        .status(400)
        .json({ msg: "Last name must be at least 3 characters long!" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters long!" });
    }
    if (address.length < 5) {
      return res
        .status(400)
        .json({ msg: "Address must be at least 5 characters long!" });
    }

    // Phone number validation
    const phoneRegex = /^03\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        msg: "Phone number must start with '03' and be 11 digits long!",
      });
    }

    // Existing email, username, phone validations
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res
        .status(400)
        .json({ msg: "Email already exists, use another!" });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ msg: "Username already taken, choose another!" });
    }

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res
        .status(400)
        .json({ msg: "Phone number already exists, use another!" });
    }

    // Validate role
    const adminCount = await User.countDocuments({ role: "admin" });
    let assignedRole = "client";

    if (role === "admin") {
      if (
        (email.toLowerCase() === "umeralisher.developer@gmail.com" ||
          email.toLowerCase() === "umeralisher.developer@gmail.com") &&
        adminCount < 2
      ) {
        assignedRole = "admin";
      } else {
        return res.status(400).json({
          msg: "Only specific emails can register as admin, or admin limit reached!",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      firstname,
      lastname,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
      phone,
      address,
    });

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables.");
    }

    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res
      .status(201)
      .json({ newUser, token, msg: "Account created successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server Error", error: error.message });
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

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(400).json({ msg: "Invalid or expired token!" });
    }

    const query = {
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    };

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token!" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;

    try {
      await user.save();
      console.log("Password Updated Successfully");
      res.status(200).json({ msg: "Password reset successfully!" });
    } catch (err) {
      return res
        .status(500)
        .json({ msg: "Error saving user data", error: err.message });
    }
  } catch (error) {
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
