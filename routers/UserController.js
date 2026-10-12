const express = require("express");
const router = express.Router();
const { auth, roleGuard } = require("../middleware/auth");
const {
  registerUser,
  loginUser,
  getUser,
  getAllUsers,
  deleteUser,
} = require("../controllers/UserController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getUser);
router.get("/users", auth, roleGuard("admin"), getAllUsers);
router.delete("/:id", auth, roleGuard("admin"), deleteUser);

module.exports = router;