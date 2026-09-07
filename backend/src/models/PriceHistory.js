const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    productName: { type: String, index: true },
    district: String,
    date: Date,
    mandiPrice: Number,
    directAvgPrice: Number,
  },
  { timestamps: true }
);

priceHistorySchema.index({ productName: 1, date: 1 });

module.exports = mongoose.model("PriceHistory", priceHistorySchema);
