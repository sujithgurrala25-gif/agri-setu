const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    againstUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    subject: String,
    details: String,
    status: { type: String, enum: ["open", "reviewing", "resolved"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
