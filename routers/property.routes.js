const express = require("express");
const router = express.Router();
const { auth, roleGuard } = require("../middleware/auth");
const Property = require("../models/Property");

router.post(
  "/",
  auth,
  roleGuard("landlord", "admin"),
  async (req, res) => {
    try {
      const images = Array.isArray(req.body.images)
        ? req.body.images
        : req.body.imageUrl
          ? [req.body.imageUrl]
          : [];

      const property = new Property({
        ...req.body,
        landlord: req.user.id,
        images,
        imageUrl: images[0] || "",
      });
      await property.save();
      res.status(201).json(property);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("landlord", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/mine", auth, roleGuard("landlord", "admin"), async (req, res) => {
  try {
    const properties = await Property.find({ landlord: req.user.id })
      .populate("landlord", "firstName lastName email");
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("landlord", "firstName lastName email");
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put(
  "/:id",
  auth,
  roleGuard("landlord", "admin"),
  async (req, res) => {
    try {
      const images = Array.isArray(req.body.images)
        ? req.body.images
        : req.body.imageUrl
          ? [req.body.imageUrl]
          : undefined;

      const update = { ...req.body };
      if (images !== undefined) {
        update.images = images;
        update.imageUrl = images[0] || "";
      }

      const property = await Property.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!property) return res.status(404).json({ message: "Property not found" });
      res.json(property);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.patch(
  "/:id",
  auth,
  roleGuard("landlord", "admin"),
  async (req, res) => {
    try {
      const images = Array.isArray(req.body.images)
        ? req.body.images
        : req.body.imageUrl
          ? [req.body.imageUrl]
          : undefined;

      const update = { ...req.body };
      if (images !== undefined) {
        update.images = images;
        update.imageUrl = images[0] || "";
      }

      const property = await Property.findByIdAndUpdate(req.params.id, update, {
        new: true,
      });
      if (!property) return res.status(404).json({ message: "Property not found" });
      res.json(property);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete(
  "/:id",
  auth,
  roleGuard("landlord", "admin"),
  async (req, res) => {
    try {
      const property = await Property.findByIdAndDelete(req.params.id);
      if (!property) return res.status(404).json({ message: "Property deleted" });
      res.json({ message: "Property deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;