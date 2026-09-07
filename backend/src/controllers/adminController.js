const User = require("../models/User");
const FarmerProfile = require("../models/FarmerProfile");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Complaint = require("../models/Complaint");
const { notify } = require("../services/notify");

async function users(req, res, next) {
  try {
    const list = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json({ users: list });
  } catch (err) {
    next(err);
  }
}

async function verifyFarmer(req, res, next) {
  try {
    const profile = await FarmerProfile.findOne({ user: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Farmer profile not found" });
    profile.verificationStatus = req.body.status;
    profile.verificationNote = req.body.note || "";
    await profile.save();
    await notify(profile.user, {
      title: "Verification update",
      body:
        req.body.status === "verified"
          ? "Your farm is verified. Buyers will see the Verified Farmer badge."
          : `Verification status: ${req.body.status}.`,
      type: "general",
    });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

async function farmers(req, res, next) {
  try {
    const list = await FarmerProfile.find().populate("user", "name email phone");
    res.json({ farmers: list });
  } catch (err) {
    next(err);
  }
}

async function products(req, res, next) {
  try {
    const products = await Product.find().populate("farmer", "name").sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

async function toggleProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });
    product.isActive = req.body.isActive;
    await product.save();
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function payments(req, res, next) {
  try {
    const list = await Payment.find().populate("buyer", "name").populate("farmer", "name").sort({ createdAt: -1 });
    res.json({ payments: list });
  } catch (err) {
    next(err);
  }
}

async function complaints(req, res, next) {
  try {
    const list = await Complaint.find().populate("reporter", "name").populate("againstUser", "name").sort({ createdAt: -1 });
    res.json({ complaints: list });
  } catch (err) {
    next(err);
  }
}

async function updateComplaint(req, res, next) {
  try {
    const c = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ complaint: c });
  } catch (err) {
    next(err);
  }
}

async function createComplaint(req, res, next) {
  try {
    const c = await Complaint.create({
      reporter: req.user._id,
      againstUser: req.body.againstUser,
      order: req.body.order,
      subject: req.body.subject,
      details: req.body.details,
    });
    const admins = await User.find({ role: "admin" });
    await Promise.all(
      admins.map((a) =>
        notify(a._id, {
          title: "New complaint",
          body: c.subject,
          type: "complaint",
        })
      )
    );
    res.status(201).json({ complaint: c });
  } catch (err) {
    next(err);
  }
}

async function riskFlags(req, res, next) {
  try {
    const highValue = await Order.find({ total: { $gt: 25000 } }).limit(20);
    const pendingOld = await Order.find({
      status: "PENDING",
      createdAt: { $lt: new Date(Date.now() - 86400000) },
    });
    res.json({
      flags: [
        ...highValue.map((o) => ({
          type: "high_value_order",
          orderId: o._id,
          detail: `${o.orderNumber} total ₹${o.total}`,
        })),
        ...pendingOld.map((o) => ({
          type: "stale_pending",
          orderId: o._id,
          detail: `${o.orderNumber} still PENDING`,
        })),
      ],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  users,
  verifyFarmer,
  farmers,
  products,
  toggleProduct,
  payments,
  complaints,
  updateComplaint,
  createComplaint,
  riskFlags,
};
