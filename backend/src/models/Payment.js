const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: Number,
    method: { type: String, enum: ["demo_upi", "demo_card", "demo_cod"], default: "demo_upi" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    reference: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
