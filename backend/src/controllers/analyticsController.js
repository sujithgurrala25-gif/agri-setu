const { demandSupplySnapshot } = require("../services/demandSupply");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const FarmerProfile = require("../models/FarmerProfile");
const Payment = require("../models/Payment");
const Complaint = require("../models/Complaint");

async function farmerAnalytics(req, res, next) {
  try {
    const snapshot = await demandSupplySnapshot();
    const myProducts = await Product.find({ farmer: req.user._id });
    const orders = await Order.find({ farmer: req.user._id });
    const byName = {};
    for (const o of orders) {
      for (const i of o.items) {
        byName[i.name] = (byName[i.name] || 0) + i.lineTotal;
      }
    }
    const bestSellers = Object.entries(byName)
      .map(([product, revenue]) => ({ product, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    res.json({
      snapshot,
      inventory: myProducts,
      bestSellers,
      seasonalNote:
        "Kharif vegetables typically see higher demand before festivals; winter leafy greens tighten supply in Dec–Jan. Figures combine live listings with seeded mandi references.",
    });
  } catch (err) {
    next(err);
  }
}

async function adminStats(req, res, next) {
  try {
    const [users, farmers, products, orders, payments, complaints, pending] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "farmer" }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
      Complaint.countDocuments({ status: "open" }),
      FarmerProfile.countDocuments({ verificationStatus: "pending" }),
    ]);
    const snapshot = await demandSupplySnapshot();
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8).populate("buyer", "name").populate("farmer", "name");
    res.json({
      users,
      farmers,
      products,
      orders,
      gmv: payments[0]?.total || 0,
      openComplaints: complaints,
      pendingVerifications: pending,
      snapshot,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { farmerAnalytics, adminStats };
