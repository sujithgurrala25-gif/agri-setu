const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", unique: true },
    currentLat: Number,
    currentLng: Number,
    destLat: Number,
    destLng: Number,
    driverName: { type: String, default: "AgriSetu Logistics (simulated)" },
    checkpoints: [
      {
        label: String,
        lat: Number,
        lng: Number,
        at: Date,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
