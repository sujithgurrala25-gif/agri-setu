function buildTransparency({ farmerPrice, market }) {
  const traditional = market?.traditional || {
    farmer: Math.round(farmerPrice * 0.62 * 10) / 10,
    trader: Math.round(farmerPrice * 0.78 * 10) / 10,
    wholesaler: Math.round(farmerPrice * 0.92 * 10) / 10,
    retailer: Math.round(farmerPrice * 1.2 * 10) / 10,
    consumer: Math.round(farmerPrice * 1.2 * 10) / 10,
  };

  const logistics = 2;
  const platform = 1;
  const consumerDirect = Math.round((farmerPrice + logistics + platform) * 10) / 10;

  const farmerUpliftPct = Math.round(
    ((farmerPrice - traditional.farmer) / Math.max(traditional.farmer, 1)) * 100
  );
  const consumerSavePct = Math.round(
    ((traditional.consumer - consumerDirect) / Math.max(traditional.consumer, 1)) * 100
  );

  return {
    traditional: {
      steps: [
        { actor: "Farmer (farm-gate)", price: traditional.farmer },
        { actor: "Village trader", price: traditional.trader },
        { actor: "Wholesaler", price: traditional.wholesaler },
        { actor: "Retailer", price: traditional.retailer },
        { actor: "Consumer pays", price: traditional.consumer },
      ],
      farmerEarns: traditional.farmer,
      consumerPays: traditional.consumer,
    },
    direct: {
      steps: [
        { actor: "Farmer (direct list)", price: farmerPrice },
        { actor: "Platform + logistics", price: logistics + platform, note: `₹${logistics} logistics + ₹${platform} platform /kg` },
        { actor: "Consumer pays", price: consumerDirect },
      ],
      farmerEarns: farmerPrice,
      consumerPays: consumerDirect,
      logisticsPerKg: logistics,
      platformPerKg: platform,
    },
    insight: {
      farmerUpliftPct,
      consumerSavePct,
      extraRupeesToFarmer: Math.round((farmerPrice - traditional.farmer) * 10) / 10,
      rupeesSavedByConsumer: Math.round((traditional.consumer - consumerDirect) * 10) / 10,
      intermediariesRemoved: 3,
    },
  };
}

module.exports = { buildTransparency };
