const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: 500,
    },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

applicationSchema.index({ tenant: 1, property: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);