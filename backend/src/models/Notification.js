const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: String,
    body: String,
    type: {
      type: String,
      enum: [
        "new_order",
        "order_status",
        "order_cancel",
        "price_update",
        "low_inventory",
        "bulk_demand",
        "farmer_signup",
        "complaint",
        "suspicious",
        "delivery",
        "general",
      ],
      default: "general",
    },
    read: { type: Boolean, default: false },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
