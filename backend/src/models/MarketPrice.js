const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, index: true },
    district: String,
    state: String,
    unit: { type: String, default: "kg" },
    currentPrice: Number,
    historicalAvg: Number,
    demandLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    supplyLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
    season: String,
    traditional: {
      farmer: Number,
      trader: Number,
      wholesaler: Number,
      retailer: Number,
      consumer: Number,
    },
    asOf: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarketPrice", marketPriceSchema);
