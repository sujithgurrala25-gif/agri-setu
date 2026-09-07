const MarketPrice = require("../models/MarketPrice");
const PriceHistory = require("../models/PriceHistory");
const { recommendFairPrice } = require("../services/fairPrice");
const { buildTransparency } = require("../services/transparency");

async function recommend(req, res, next) {
  try {
    const { productName, listedPrice, quantity, district } = req.body;
    const market = await MarketPrice.findOne({
      productName,
      ...(district ? { district } : {}),
    });
    const fair = recommendFairPrice({
      productName,
      listedPrice: listedPrice != null ? Number(listedPrice) : undefined,
      quantity: Number(quantity) || 0,
      market,
    });
    const transparency = buildTransparency({
      farmerPrice: fair.recommended,
      market,
    });
    res.json({ fair, market, transparency });
  } catch (err) {
    next(err);
  }
}

async function market(req, res, next) {
  try {
    const list = await MarketPrice.find().sort({ productName: 1 });
    res.json({ markets: list });
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const name = req.query.product || "Tomato";
    const rows = await PriceHistory.find({ productName: name }).sort({ date: 1 });
    res.json({ productName: name, history: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { recommend, market, history };
