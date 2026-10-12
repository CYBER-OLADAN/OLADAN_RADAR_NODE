const express = require("express");
const router = express.Router();
const { auth, roleGuard } = require("../middleware/auth");
const { saveProperty, getSaved, removeSaved } = require("../controllers/saved.controller");

router.post("/", auth, roleGuard("tenant"), saveProperty);
router.get("/", auth, roleGuard("tenant"), getSaved);
router.delete("/:id", auth, roleGuard("tenant"), removeSaved);

module.exports = router;