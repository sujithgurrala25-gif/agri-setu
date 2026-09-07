const LEVEL_SCORE = { LOW: 0.25, MEDIUM: 0.5, HIGH: 0.85 };

const SEASON_ADJ = {
  summer: 0.04,
  monsoon: -0.02,
  winter: 0.01,
  harvest: 0,
};

function roundRupee(n) {
  return Math.round(n * 2) / 2;
}

/**
 * Rule-based fair-price band for SIH demo.
 * Weights current mandi price, history, demand, supply, season, lot size.
 * Does not claim ML accuracy.
 */
function recommendFairPrice({
  productName,
  listedPrice,
  quantity = 0,
  market,
}) {
  const current = market?.currentPrice ?? listedPrice ?? 25;
  const historical = market?.historicalAvg ?? current * 0.92;
  const demand = LEVEL_SCORE[market?.demandLevel] ?? 0.5;
  const supply = LEVEL_SCORE[market?.supplyLevel] ?? 0.5;
  const seasonKey = (market?.season || "harvest").toLowerCase();
  const seasonAdj = SEASON_ADJ[seasonKey] ?? 0;

  const blended = current * 0.45 + historical * 0.35 + current * 0.2;
  const demandAdj = (demand - 0.5) * 0.14;
  const supplyAdj = (0.5 - supply) * 0.12;
  const qtyAdj = quantity >= 250 ? -0.04 : quantity >= 100 ? -0.015 : quantity > 0 && quantity < 40 ? 0.025 : 0;

  const midpoint = blended * (1 + demandAdj + supplyAdj + seasonAdj + qtyAdj);
  const min = roundRupee(midpoint * 0.96);
  const max = roundRupee(midpoint * 1.08);
  const recommended = roundRupee(midpoint);

  const reasons = [
    `${productName || "This crop"} mandi/market reference is ₹${current}/kg.`,
    `90-day historical average is ₹${historical}/kg (weight 35%).`,
    `Demand is ${market?.demandLevel || "MEDIUM"} and supply is ${market?.supplyLevel || "MEDIUM"}, so the band is shifted ${demandAdj + supplyAdj >= 0 ? "up" : "down"} slightly.`,
    `Season factor (${market?.season || "harvest"}): ${Math.round(seasonAdj * 100)}%.`,
    quantity
      ? `Listed quantity ${quantity} kg applies a ${qtyAdj >= 0 ? "small-lot premium" : "bulk discount"} of ${Math.round(qtyAdj * 1000) / 10}%.`
      : "Lot size was not provided; no quantity adjustment.",
    "This is a transparent rule engine for the prototype — not a guaranteed market forecast.",
  ];

  let listedAdvice = null;
  if (listedPrice != null) {
    if (listedPrice < min) {
      listedAdvice = `₹${listedPrice}/kg is below the suggested band. Raising toward ₹${min}–₹${max} can improve earnings without matching inflated retail markups.`;
    } else if (listedPrice > max) {
      listedAdvice = `₹${listedPrice}/kg is above the suggested band. Buyers may compare nearby listings and skip this lot.`;
    } else {
      listedAdvice = `₹${listedPrice}/kg sits inside the fair band. It is competitive for a direct farm sale.`;
    }
  }

  return {
    productName,
    marketCurrent: current,
    historicalAvg: historical,
    demandLevel: market?.demandLevel || "MEDIUM",
    supplyLevel: market?.supplyLevel || "MEDIUM",
    season: market?.season || "harvest",
    listedPrice,
    recommended,
    band: { min, max },
    display: `₹${min}–₹${max}/kg`,
    reasons,
    listedAdvice,
    method: "weighted-rules",
  };
}

module.exports = { recommendFairPrice };
