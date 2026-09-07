const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmerProfile: { type: mongoose.Schema.Types.ObjectId, ref: "FarmerProfile" },
    name: { type: String, required: true, index: true },
    slug: String,
    category: {
      type: String,
      enum: ["vegetables", "fruits", "grains", "pulses", "spices", "dairy", "other"],
      default: "vegetables",
      index: true,
    },
    description: String,
    images: [String],
    unit: { type: String, default: "kg" },
    pricePerUnit: { type: Number, required: true, min: 0 },
    quantityAvailable: { type: Number, required: true, min: 0 },
    harvestDate: Date,
    location: {
      district: String,
      state: String,
      lat: Number,
      lng: Number,
    },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });
productSchema.index({ "location.lat": 1, "location.lng": 1 });

module.exports = mongoose.model("Product", productSchema);
