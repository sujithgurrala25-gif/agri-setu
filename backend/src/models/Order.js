const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    unit: String,
    quantity: Number,
    pricePerUnit: Number,
    lineTotal: Number,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    type: { type: String, enum: ["retail", "bulk_allocation"], default: "retail" },
    bulkOrder: { type: mongoose.Schema.Types.ObjectId, ref: "BulkOrder" },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "PACKED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
        "REJECTED",
      ],
      default: "PENDING",
      index: true,
    },
    subtotal: Number,
    logisticsFee: Number,
    platformFee: Number,
    total: Number,
    deliveryAddress: {
      line1: String,
      city: String,
      pincode: String,
      lat: Number,
      lng: Number,
    },
    paymentStatus: { type: String, enum: ["unpaid", "paid", "refunded"], default: "unpaid" },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],
    etaMinutes: { type: Number, default: 90 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
