const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["farmer", "consumer", "institutional", "admin"],
      required: true,
      index: true,
    },
    orgName: String,
    orgType: {
      type: String,
      enum: ["restaurant", "hotel", "supermarket", "retail", "other", null],
      default: null,
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
