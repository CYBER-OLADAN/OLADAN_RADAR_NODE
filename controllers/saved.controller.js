const SavedProperty = require("../models/savedProperty.model");

exports.saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const existing = await SavedProperty.findOne({ tenant: req.user.id, property: propertyId });
    if (existing) return res.status(400).json({ message: "Already saved" });

    const saved = await SavedProperty.create({ tenant: req.user.id, property: propertyId });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSaved = async (req, res) => {
  try {
    const saved = await SavedProperty.find({ tenant: req.user.id })
      .populate("property")
      .sort({ createdAt: -1 });
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeSaved = async (req, res) => {
  try {
    const saved = await SavedProperty.findById(req.params.id);
    if (!saved) return res.status(404).json({ message: "Not found" });

    if (String(saved.tenant) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await saved.deleteOne();
    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};