const express = require("express");
const router = express.Router();
const { auth, roleGuard } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getUser,
  updateProfile,
  getAllUsers,
  deleteUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/user.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", getUser);
router.patch("/profile", auth, updateProfile);
router.get("/users", getAllUsers);
router.delete("/:id", deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);

module.exports = router;