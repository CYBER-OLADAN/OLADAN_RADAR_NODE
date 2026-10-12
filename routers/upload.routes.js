const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImage } = require("../controllers/upload.controller");

router.post("/image", auth, (req, res, next) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadImage);

module.exports = router;