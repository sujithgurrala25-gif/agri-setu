const { haversineKm } = require("../utils/haversine");

/**
 * Greedy match: nearest verified (or any) farmers until demand kg is filled.
 * Prefers price closer to buyer's preferred price, then distance, then rating.
 */
function matchFarmersToDemand({
  demandKg,
  preferredPrice,
  origin,
  listings,
}) {
  const scored = listings
    .map((row) => {
      const distanceKm =
        origin && row.lat != null
          ? haversineKm(origin, { lat: row.lat, lng: row.lng })
          : 99;
      const priceGap =
        preferredPrice != null ? Math.abs(row.pricePerUnit - preferredPrice) : 0;
      const rating = row.rating || 0;
      const score = priceGap * 1.2 + (distanceKm || 20) * 0.8 - rating * 2;
      return { ...row, distanceKm, score };
    })
    .sort((a, b) => a.score - b.score);

  const allocations = [];
  let remaining = demandKg;

  for (const row of scored) {
    if (remaining <= 0) break;
    const take = Math.min(row.quantityAvailable, remaining);
    if (take <= 0) continue;
    allocations.push({
      farmer: row.farmerId,
      product: row.productId,
      farmName: row.farmName,
      quantityKg: take,
      pricePerUnit: row.pricePerUnit,
      distanceKm: row.distanceKm,
      status: "proposed",
    });
    remaining -= take;
  }

  const matchedKg = demandKg - remaining;
  return {
    allocations,
    matchedKg,
    remainingKg: remaining,
    filled: remaining <= 0,
    status: remaining <= 0 ? "matched" : matchedKg > 0 ? "partial" : "open",
  };
}

module.exports = { matchFarmersToDemand };
