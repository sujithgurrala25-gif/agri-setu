const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    farmName: String,
    quantityKg: Number,
    pricePerUnit: Number,
    distanceKm: Number,
    status: {
      type: String,
      enum: ["proposed", "accepted", "rejected"],
      default: "proposed",
    },
  },
  { _id: true }
);

const bulkOrderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productName: { type: String, required: true },
    quantityKg: { type: Number, required: true },
    preferredPrice: Number,
    notes: String,
    status: {
      type: String,
      enum: ["open", "matched", "partial", "accepted", "fulfilled", "cancelled"],
      default: "open",
      index: true,
    },
    deliveryCity: String,
    deliveryLat: Number,
    deliveryLng: Number,
    allocations: [allocationSchema],
    matchedKg: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BulkOrder", bulkOrderSchema);
