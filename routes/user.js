const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  forgetPassword,
  resetPassword,
  deleteUser,
  updateUser,
  getAllUsers,
} = require("../controllers/user");
const User = require("../models/User");

// Register a new user
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forget password
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);

// Get account details (client/admin only)
router.get(
  "/account",
  authMiddleware(["client", "admin"]),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }
      res.status(200).json({ user });
    } catch (error) {
      console.error("Error fetching account details:", error.message);
      res.status(500).json({ msg: "Internal server error" });
    }
  }
);

// Get all users (admin only)
router.get("/get-users", authMiddleware(["admin"]), getAllUsers);

// Delete a user (admin only)
router.delete("/delete/:id", authMiddleware(["admin"]), deleteUser);

// Update user details (admin/client depending on permissions)
router.put("/update/:id", authMiddleware(["admin", "client"]), updateUser);

module.exports = router;
