const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUser, registerOperator, loginOperator, getUserByOperator, updateUser, resolveAccount } = require("../controllers/user.controller");
const auth = require("../middleware/auth");
const roleGuard = require("../middleware/roleGuard");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/loginOperator", loginOperator);
router.get("/getuser", auth, getUser);
router.post("/operator/register", registerOperator);
router.post("/operator/create-user", registerOperator);
router.get("/getuser/:id", auth, roleGuard("operator", "admin"), getUserByOperator);
router.put("/updateUser/:id", auth, roleGuard("operator", "admin"), updateUser);
router.get("/user/:accountNumber", auth, resolveAccount);

module.exports = router;
