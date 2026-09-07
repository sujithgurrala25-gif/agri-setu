const Product = require("../models/Product");
const Order = require("../models/Order");
const MarketPrice = require("../models/MarketPrice");

const TREND_MAP = {
  Tomato: 8,
  Potato: -3,
  Onion: 5,
  Wheat: 1,
  Mango: 12,
  Rice: -1,
};

async function demandSupplySnapshot() {
  const products = await Product.find({ isActive: true });
  const orders = await Order.find({ createdAt: { $gte: new Date(Date.now() - 14 * 86400000) } });
  const markets = await MarketPrice.find();
  const marketByName = Object.fromEntries(markets.map((m) => [m.productName, m]));

  const demandQty = {};
  for (const o of orders) {
    if (o.status === "CANCELLED" || o.status === "REJECTED") continue;
    for (const item of o.items || []) {
      demandQty[item.name] = (demandQty[item.name] || 0) + item.quantity;
    }
  }

  const supplyQty = {};
  for (const p of products) {
    supplyQty[p.name] = (supplyQty[p.name] || 0) + p.quantityAvailable;
  }

  const names = Array.from(new Set([...Object.keys(supplyQty), ...Object.keys(demandQty), ...markets.map((m) => m.productName)]));

  return names.map((name) => {
    const m = marketByName[name];
    const demand = demandQty[name] || 0;
    const supply = supplyQty[name] || 0;
    const demandLevel = m?.demandLevel || (demand > 80 ? "HIGH" : demand > 30 ? "MEDIUM" : "LOW");
    const supplyLevel = m?.supplyLevel || (supply > 400 ? "HIGH" : supply > 150 ? "MEDIUM" : "LOW");
    return {
      product: name,
      demandKg: demand,
      supplyKg: supply,
      demandLevel,
      supplyLevel,
      priceTrendPct: TREND_MAP[name] ?? 2,
      currentPrice: m?.currentPrice,
    };
  });
}

module.exports = { demandSupplySnapshot };
