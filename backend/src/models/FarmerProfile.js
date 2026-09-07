const mongoose = require("mongoose");

const farmerProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    farmName: { type: String, required: true },
    bio: String,
    location: {
      address: String,
      village: String,
      district: String,
      state: { type: String, default: "Maharashtra" },
      lat: Number,
      lng: Number,
    },
    landSizeAcres: Number,
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    verificationNote: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    crops: [String],
  },
  { timestamps: true }
);

farmerProfileSchema.index({ "location.lat": 1, "location.lng": 1 });

module.exports = mongoose.model("FarmerProfile", farmerProfileSchema);
