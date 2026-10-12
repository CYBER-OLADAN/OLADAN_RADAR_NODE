const express = require("express");
const router = express.Router();
const { auth, roleGuard } = require("../middleware/auth");
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
} = require("../controllers/application.controller");

router.post("/", auth, roleGuard("tenant"), createApplication);
router.get("/", auth, getApplications);
router.patch("/:id", auth, roleGuard("landlord"), updateApplication);
router.delete("/:id", auth, roleGuard("tenant"), deleteApplication);

module.exports = router;