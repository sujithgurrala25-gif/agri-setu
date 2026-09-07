const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Delivery = require("../models/Delivery");
const FarmerProfile = require("../models/FarmerProfile");
const User = require("../models/User");
const { notify } = require("../services/notify");
const { buildTransparency } = require("../services/transparency");
const MarketPrice = require("../models/MarketPrice");

function orderNumber() {
  return `AS-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
}

async function createOrder(req, res, next) {
  try {
    const { items, deliveryAddress, paymentMethod = "demo_upi" } = req.body;
    if (!items?.length) return res.status(400).json({ message: "Cart is empty" });

    const product = await Product.findById(items[0].productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const resolved = [];
    let subtotal = 0;
    for (const line of items) {
      const p = await Product.findById(line.productId);
      if (!p || !p.isActive) return res.status(400).json({ message: "A product is unavailable" });
      if (p.farmer.toString() !== product.farmer.toString()) {
        return res.status(400).json({ message: "Checkout one farmer at a time in this prototype" });
      }
      const qty = Number(line.quantity);
      if (qty > p.quantityAvailable) {
        return res.status(400).json({ message: `Only ${p.quantityAvailable} ${p.unit} of ${p.name} left` });
      }
      const lineTotal = qty * p.pricePerUnit;
      subtotal += lineTotal;
      resolved.push({
        product: p._id,
        farmer: p.farmer,
        name: p.name,
        unit: p.unit,
        quantity: qty,
        pricePerUnit: p.pricePerUnit,
        lineTotal,
      });
    }

    const logisticsFee = Math.max(30, Math.round(subtotal * 0.04));
    const platformFee = Math.round(subtotal * 0.03);
    const total = subtotal + logisticsFee + platformFee;

    const order = await Order.create({
      orderNumber: orderNumber(),
      buyer: req.user._id,
      farmer: product.farmer,
      type: "retail",
      items: resolved,
      status: "PENDING",
      subtotal,
      logisticsFee,
      platformFee,
      total,
      deliveryAddress: deliveryAddress || {},
      paymentStatus: "paid",
      statusHistory: [{ status: "PENDING", note: "Order placed" }],
      etaMinutes: 75,
    });

    for (const line of resolved) {
      await Product.updateOne({ _id: line.product }, { $inc: { quantityAvailable: -line.quantity } });
    }

    await Payment.create({
      order: order._id,
      buyer: req.user._id,
      farmer: product.farmer,
      amount: total,
      method: paymentMethod,
      status: "success",
      reference: `PAY-${order.orderNumber}`,
    });

    const addr = deliveryAddress || {};
    await Delivery.create({
      order: order._id,
      destLat: addr.lat || 18.52,
      destLng: addr.lng || 73.85,
      currentLat: product.location?.lat,
      currentLng: product.location?.lng,
      checkpoints: [{ label: "Order received at farm", lat: product.location?.lat, lng: product.location?.lng, at: new Date() }],
    });

    await notify(product.farmer, {
      title: "New order",
      body: `${req.user.name} ordered ${resolved.map((i) => `${i.quantity}${i.unit} ${i.name}`).join(", ")}.`,
      type: "new_order",
      meta: { orderId: order._id },
    });
    await notify(req.user._id, {
      title: "Order confirmed",
      body: `Payment received for ${order.orderNumber}. Waiting for farmer acceptance.`,
      type: "order_status",
    });

    const market = await MarketPrice.findOne({ productName: resolved[0].name });
    const transparency = buildTransparency({ farmerPrice: resolved[0].pricePerUnit, market });

    res.status(201).json({ order, transparency });
  } catch (err) {
    next(err);
  }
}

async function listOrders(req, res, next) {
  try {
    const filter = req.user.role === "farmer" ? { farmer: req.user._id } : { buyer: req.user._id };
    if (req.user.role === "admin") {
      const orders = await Order.find().populate("buyer", "name").populate("farmer", "name").sort({ createdAt: -1 }).limit(200);
      return res.json({ orders });
    }
    const orders = await Order.find(filter).populate("buyer", "name").populate("farmer", "name").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("farmer", "name");
    if (!order) return res.status(404).json({ message: "Order not found" });
    const mine =
      req.user.role === "admin" ||
      order.buyer._id.equals(req.user._id) ||
      (order.farmer && order.farmer._id.equals(req.user._id));
    if (!mine) return res.status(403).json({ message: "Not allowed" });
    const delivery = await Delivery.findOne({ order: order._id });
    res.json({ order, delivery });
  } catch (err) {
    next(err);
  }
}

const NEXT = {
  PENDING: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["PACKED", "CANCELLED"],
  PACKED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["DELIVERED"],
};

async function updateStatus(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const { status } = req.body;
    const isFarmer = order.farmer && order.farmer.equals(req.user._id);
    const isBuyer = order.buyer.equals(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (status === "CANCELLED" && isBuyer && order.status === "PENDING") {
      // ok
    } else if (isFarmer || isAdmin) {
      const allowed = NEXT[order.status] || [];
      if (!allowed.includes(status) && !isAdmin) {
        return res.status(400).json({ message: `Cannot move from ${order.status} to ${status}` });
      }
    } else {
      return res.status(403).json({ message: "Not allowed" });
    }

    order.status = status;
    order.statusHistory.push({ status, note: req.body.note || "" });
    if (status === "DELIVERED") {
      await FarmerProfile.updateOne({ user: order.farmer }, { $inc: { completedOrders: 1 } });
    }
    if (status === "REJECTED" || status === "CANCELLED") {
      for (const item of order.items) {
        if (item.product) await Product.updateOne({ _id: item.product }, { $inc: { quantityAvailable: item.quantity } });
      }
      await notify(order.farmer, {
        title: "Order cancelled",
        body: `${order.orderNumber} is ${status}.`,
        type: "order_cancel",
      });
    }
    await order.save();

    const delivery = await Delivery.findOne({ order: order._id });
    if (delivery) {
      delivery.checkpoints.push({
        label: status.replaceAll("_", " "),
        at: new Date(),
        lat: delivery.currentLat,
        lng: delivery.currentLng,
      });
      await delivery.save();
    }

    await notify(order.buyer, {
      title: "Order update",
      body: `${order.orderNumber} is now ${status.replaceAll("_", " ")}.`,
      type: status === "DELIVERED" || status.includes("TRANSIT") ? "delivery" : "order_status",
    });

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function earnings(req, res, next) {
  try {
    const orders = await Order.find({
      farmer: req.user._id,
      status: { $in: ["ACCEPTED", "PACKED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"] },
    });
    const gross = orders.reduce((s, o) => s + o.subtotal, 0);
    const delivered = orders.filter((o) => o.status === "DELIVERED");
    res.json({
      orderCount: orders.length,
      deliveredCount: delivered.length,
      grossEarnings: gross,
      deliveredEarnings: delivered.reduce((s, o) => s + o.subtotal, 0),
      recent: orders.slice(0, 12),
    });
  } catch (err) {
    next(err);
  }
}

async function flagSuspicious(req, res, next) {
  try {
    const admins = await User.find({ role: "admin" });
    await Promise.all(
      admins.map((a) =>
        notify(a._id, {
          title: "Suspicious activity",
          body: req.body.details || "Manual flag",
          type: "suspicious",
        })
      )
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, listOrders, getOrder, updateStatus, earnings, flagSuspicious };
