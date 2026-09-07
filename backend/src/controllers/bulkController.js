const BulkOrder = require("../models/BulkOrder");
const Product = require("../models/Product");
const FarmerProfile = require("../models/FarmerProfile");
const Order = require("../models/Order");
const User = require("../models/User");
const { matchFarmersToDemand } = require("../services/aggregation");
const { notify } = require("../services/notify");

async function createBulk(req, res, next) {
  try {
    const bulk = await BulkOrder.create({
      buyer: req.user._id,
      productName: req.body.productName,
      quantityKg: Number(req.body.quantityKg),
      preferredPrice: req.body.preferredPrice != null ? Number(req.body.preferredPrice) : undefined,
      notes: req.body.notes,
      deliveryCity: req.body.deliveryCity,
      deliveryLat: req.body.deliveryLat,
      deliveryLng: req.body.deliveryLng,
    });

    const farmers = await User.find({ role: "farmer" }).select("_id");
    await Promise.all(
      farmers.map((f) =>
        notify(f._id, {
          title: "New bulk demand",
          body: `${req.user.orgName || req.user.name} needs ${bulk.quantityKg} kg ${bulk.productName}.`,
          type: "bulk_demand",
          meta: { bulkId: bulk._id },
        })
      )
    );
    res.status(201).json({ bulk });
  } catch (err) {
    next(err);
  }
}

async function matchBulk(req, res, next) {
  try {
    const bulk = await BulkOrder.findById(req.params.id);
    if (!bulk) return res.status(404).json({ message: "Bulk order not found" });

    const products = await Product.find({
      name: new RegExp(`^${bulk.productName}$`, "i"),
      isActive: true,
      quantityAvailable: { $gt: 0 },
    }).populate("farmerProfile");

    const listings = products.map((p) => ({
      farmerId: p.farmer,
      productId: p._id,
      farmName: p.farmerProfile?.farmName || "Farm",
      quantityAvailable: p.quantityAvailable,
      pricePerUnit: p.pricePerUnit,
      rating: p.farmerProfile?.rating || 0,
      lat: p.location?.lat,
      lng: p.location?.lng,
    }));

    const result = matchFarmersToDemand({
      demandKg: bulk.quantityKg,
      preferredPrice: bulk.preferredPrice,
      origin: { lat: bulk.deliveryLat, lng: bulk.deliveryLng },
      listings,
    });

    bulk.allocations = result.allocations;
    bulk.matchedKg = result.matchedKg;
    bulk.status = result.status;
    await bulk.save();
    res.json({ bulk, result });
  } catch (err) {
    next(err);
  }
}

async function listBulk(req, res, next) {
  try {
    const filter = req.user.role === "institutional" || req.user.role === "admin" ? {} : {};
    let query = BulkOrder.find().populate("buyer", "name orgName").sort({ createdAt: -1 });
    if (req.user.role === "institutional") query = BulkOrder.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    if (req.user.role === "farmer") query = BulkOrder.find({ status: { $in: ["open", "matched", "partial"] } }).sort({ createdAt: -1 });
    const bulks = await query;
    res.json({ bulks });
  } catch (err) {
    next(err);
  }
}

async function acceptAllocation(req, res, next) {
  try {
    const bulk = await BulkOrder.findById(req.params.id);
    if (!bulk) return res.status(404).json({ message: "Not found" });
    const alloc = bulk.allocations.id(req.body.allocationId);
    if (!alloc) return res.status(404).json({ message: "Allocation not found" });
    const isFarmer = alloc.farmer.equals(req.user._id);
    const isBuyer = bulk.buyer.equals(req.user._id);
    if (!isFarmer && !isBuyer && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not allowed" });
    }
    alloc.status = req.body.accept ? "accepted" : "rejected";
    if (req.body.accept && isFarmer) {
      const product = await Product.findById(alloc.product);
      if (product && product.quantityAvailable >= alloc.quantityKg) {
        product.quantityAvailable -= alloc.quantityKg;
        await product.save();
      }
      await Order.create({
        orderNumber: `AS-B-${Date.now().toString(36).toUpperCase()}`,
        buyer: bulk.buyer,
        farmer: alloc.farmer,
        type: "bulk_allocation",
        bulkOrder: bulk._id,
        items: [
          {
            product: alloc.product,
            farmer: alloc.farmer,
            name: bulk.productName,
            unit: "kg",
            quantity: alloc.quantityKg,
            pricePerUnit: alloc.pricePerUnit,
            lineTotal: alloc.quantityKg * alloc.pricePerUnit,
          },
        ],
        status: "ACCEPTED",
        subtotal: alloc.quantityKg * alloc.pricePerUnit,
        logisticsFee: 0,
        platformFee: 0,
        total: alloc.quantityKg * alloc.pricePerUnit,
        paymentStatus: "unpaid",
        statusHistory: [{ status: "ACCEPTED", note: "Bulk allocation accepted" }],
      });
    }
    const allAcc = bulk.allocations.every((a) => a.status === "accepted");
    if (allAcc && bulk.allocations.length) bulk.status = "accepted";
    await bulk.save();
    res.json({ bulk });
  } catch (err) {
    next(err);
  }
}

module.exports = { createBulk, matchBulk, listBulk, acceptAllocation };
