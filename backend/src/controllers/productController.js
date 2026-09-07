const Product = require("../models/Product");
const FarmerProfile = require("../models/FarmerProfile");
const MarketPrice = require("../models/MarketPrice");
const { haversineKm } = require("../utils/haversine");
const { recommendFairPrice } = require("../services/fairPrice");
const { buildTransparency } = require("../services/transparency");

function originFromQuery(q) {
  if (q.lat == null || q.lng == null) return null;
  return { lat: Number(q.lat), lng: Number(q.lng) };
}

async function listProducts(req, res, next) {
  try {
    const { q, category, minPrice, maxPrice, sort = "nearest" } = req.query;
    const filter = { isActive: true };
    if (q) filter.name = new RegExp(q, "i");
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }

    let products = await Product.find(filter)
      .populate("farmer", "name")
      .populate("farmerProfile")
      .lean();

    const origin = originFromQuery(req.query);
    products = products.map((p) => {
      const loc = p.location || p.farmerProfile?.location || {};
      const distanceKm = origin ? haversineKm(origin, { lat: loc.lat, lng: loc.lng }) : null;
      return {
        ...p,
        distanceKm,
        farmerName: p.farmer?.name,
        farmName: p.farmerProfile?.farmName,
        rating: p.farmerProfile?.rating || 0,
        verificationStatus: p.farmerProfile?.verificationStatus,
      };
    });

    const sorters = {
      nearest: (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999),
      price: (a, b) => a.pricePerUnit - b.pricePerUnit,
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      availability: (a, b) => b.quantityAvailable - a.quantityAvailable,
    };
    products.sort(sorters[sort] || sorters.nearest);

    res.json({ products });
  } catch (err) {
    next(err);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id)
      .populate("farmer", "name")
      .populate("farmerProfile")
      .lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    await Product.updateOne({ _id: product._id }, { $inc: { views: 1 } });

    const market = await MarketPrice.findOne({ productName: product.name });
    const fair = recommendFairPrice({
      productName: product.name,
      listedPrice: product.pricePerUnit,
      quantity: product.quantityAvailable,
      market,
    });
    const transparency = buildTransparency({ farmerPrice: product.pricePerUnit, market });

    const origin = originFromQuery(req.query);
    const loc = product.location || product.farmerProfile?.location || {};
    const distanceKm = origin ? haversineKm(origin, { lat: loc.lat, lng: loc.lng }) : null;

    const comparables = await Product.find({
      _id: { $ne: product._id },
      name: product.name,
      isActive: true,
    })
      .populate("farmerProfile")
      .limit(6)
      .lean();

    res.json({
      product: { ...product, distanceKm },
      fair,
      transparency,
      comparables,
    });
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const profile = await FarmerProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(400).json({ message: "Create a farmer profile first" });

    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);
    if (req.body.imageUrl) images.push(req.body.imageUrl);

    const loc = profile.location || {};
    const product = await Product.create({
      farmer: req.user._id,
      farmerProfile: profile._id,
      name: req.body.name,
      category: req.body.category || "vegetables",
      description: req.body.description,
      images,
      unit: req.body.unit || "kg",
      pricePerUnit: Number(req.body.pricePerUnit),
      quantityAvailable: Number(req.body.quantityAvailable),
      harvestDate: req.body.harvestDate,
      location: {
        district: loc.district,
        state: loc.state,
        lat: loc.lat,
        lng: loc.lng,
      },
    });

    const market = await MarketPrice.findOne({ productName: product.name });
    const fair = recommendFairPrice({
      productName: product.name,
      listedPrice: product.pricePerUnit,
      quantity: product.quantityAvailable,
      market,
    });

    if (product.quantityAvailable < 20) {
      const { notify } = require("../services/notify");
      await notify(req.user._id, {
        title: "Low inventory",
        body: `${product.name} is only ${product.quantityAvailable} ${product.unit}.`,
        type: "low_inventory",
      });
    }

    res.status(201).json({ product, fair });
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const fields = ["name", "category", "description", "unit", "pricePerUnit", "quantityAvailable", "harvestDate", "isActive"];
    for (const f of fields) {
      if (req.body[f] !== undefined) product[f] = req.body[f];
    }
    if (req.files?.length) {
      product.images = [...product.images, ...req.files.map((f) => `/uploads/${f.filename}`)];
    }
    await product.save();
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function myProducts(req, res, next) {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

async function nearbyFarmers(req, res, next) {
  try {
    const origin = originFromQuery(req.query) || { lat: 18.5204, lng: 73.8567 };
    const name = req.query.product;
    const filter = { isActive: true };
    if (name) filter.name = new RegExp(name, "i");
    const products = await Product.find(filter).populate("farmer", "name").populate("farmerProfile").lean();

    const rows = products.map((p) => {
      const loc = p.location || p.farmerProfile?.location || {};
      return {
        productId: p._id,
        farmerId: p.farmer?._id,
        farmerName: p.farmer?.name,
        farmName: p.farmerProfile?.farmName,
        product: p.name,
        pricePerUnit: p.pricePerUnit,
        quantityAvailable: p.quantityAvailable,
        unit: p.unit,
        rating: p.farmerProfile?.rating || 0,
        verificationStatus: p.farmerProfile?.verificationStatus,
        distanceKm: haversineKm(origin, { lat: loc.lat, lng: loc.lng }),
        lat: loc.lat,
        lng: loc.lng,
      };
    });

    const sort = req.query.sort || "nearest";
    const sorters = {
      nearest: (a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999),
      price: (a, b) => a.pricePerUnit - b.pricePerUnit,
      rating: (a, b) => b.rating - a.rating,
      availability: (a, b) => b.quantityAvailable - a.quantityAvailable,
    };
    rows.sort(sorters[sort] || sorters.nearest);
    res.json({ origin, farmers: rows });
  } catch (err) {
    next(err);
  }
}

async function farmerPublic(req, res, next) {
  try {
    const profile = await FarmerProfile.findOne({ user: req.params.userId }).populate("user", "name");
    if (!profile) return res.status(404).json({ message: "Farmer not found" });
    const products = await Product.find({ farmer: req.params.userId, isActive: true });
    res.json({
      farmer: {
        id: profile.user._id,
        name: profile.user.name,
        farmName: profile.farmName,
        bio: profile.bio,
        location: profile.location,
        rating: profile.rating,
        reviewCount: profile.reviewCount,
        completedOrders: profile.completedOrders,
        verificationStatus: profile.verificationStatus,
        crops: profile.crops,
      },
      products,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  myProducts,
  nearbyFarmers,
  farmerPublic,
};
