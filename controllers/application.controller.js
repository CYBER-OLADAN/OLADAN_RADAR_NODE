const Application = require("../models/application.model");
const Property = require("../models/Property");

exports.createApplication = async (req, res) => {
  try {
    const { propertyId, message } = req.body;
    if (!propertyId) return res.status(400).json({ message: "propertyId is required" });

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (String(property.landlord) === String(req.user.id)) {
      return res.status(400).json({ message: "You cannot apply to your own property" });
    }

    const existing = await Application.findOne({ tenant: req.user.id, property: propertyId });
    if (existing) return res.status(400).json({ message: "You already applied to this property" });

    const application = await Application.create({
      tenant: req.user.id,
      property: propertyId,
      landlord: property.landlord,
      message,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const filter = req.user.role === "landlord"
      ? { landlord: req.user.id }
      : req.query.status
      ? { status: req.query.status, tenant: req.user.id }
      : { tenant: req.user.id };

    const applications = await Application.find(filter)
      .populate("property", "title location price imageUrl images")
      .populate("tenant", "firstName lastName email")
      .populate("landlord", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (String(application.landlord) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status = status;
    if (status === "accepted") {
      application.acceptedAt = new Date();
    } else {
      application.acceptedAt = null;
    }
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });

    if (String(application.tenant) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await application.deleteOne();
    res.json({ message: "Application withdrawn" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};