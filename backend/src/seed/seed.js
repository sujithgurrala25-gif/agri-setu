require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const User = require("../models/User");
const FarmerProfile = require("../models/FarmerProfile");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Delivery = require("../models/Delivery");
const Review = require("../models/Review");
const MarketPrice = require("../models/MarketPrice");
const PriceHistory = require("../models/PriceHistory");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");
const BulkOrder = require("../models/BulkOrder");

const IMG = {
  tomato: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80",
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
  onion: "https://images.unsplash.com/photo-1508747703725-71977763739e?w=800&q=80",
  wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
  mango: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80",
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
};

async function seedDatabase() {
  await Promise.all([
    User.deleteMany({}),
    FarmerProfile.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Delivery.deleteMany({}),
    Review.deleteMany({}),
    MarketPrice.deleteMany({}),
    PriceHistory.deleteMany({}),
    Notification.deleteMany({}),
    Complaint.deleteMany({}),
    BulkOrder.deleteMany({}),
  ]);

  const hash = (p) => bcrypt.hash(p, 10);

  const admin = await User.create({
    name: "Platform Admin",
    email: "admin@agrisetu.in",
    phone: "0200000001",
    passwordHash: await hash("Admin@123"),
    role: "admin",
  });

  const consumer = await User.create({
    name: "Ananya Shah",
    email: "ananya@agrisetu.in",
    phone: "9876500001",
    passwordHash: await hash("Consumer@123"),
    role: "consumer",
  });

  const buyer = await User.create({
    name: "Priya Nair",
    email: "procurement@freshmart.in",
    phone: "9876500002",
    passwordHash: await hash("Buyer@123"),
    role: "institutional",
    orgName: "FreshMart Supermarkets",
    orgType: "supermarket",
  });

  const farmDefs = [
    {
      name: "Ramesh Kale",
      email: "ramesh@agrisetu.in",
      farmName: "Kale Organic Farm",
      loc: { address: "Near Wagholi", village: "Wagholi", district: "Pune", state: "Maharashtra", lat: 18.5806, lng: 73.9832 },
      rating: 4.7,
      reviews: 38,
      completed: 126,
      verified: "verified",
      crops: ["Tomato", "Onion"],
    },
    {
      name: "Sita Patil",
      email: "sita@agrisetu.in",
      farmName: "Patil Family Farms",
      loc: { address: "Hadapsar belt", village: "Hadapsar", district: "Pune", state: "Maharashtra", lat: 18.5089, lng: 73.926 },
      rating: 4.5,
      reviews: 22,
      completed: 81,
      verified: "verified",
      crops: ["Tomato", "Potato"],
    },
    {
      name: "Arjun Deshmukh",
      email: "arjun@agrisetu.in",
      farmName: "Deshmukh Produce",
      loc: { address: "Pirangut", village: "Pirangut", district: "Pune", state: "Maharashtra", lat: 18.51, lng: 73.68 },
      rating: 4.8,
      reviews: 51,
      completed: 201,
      verified: "verified",
      crops: ["Tomato", "Mango"],
    },
    {
      name: "Meera Joshi",
      email: "meera@agrisetu.in",
      farmName: "Joshi Agro",
      loc: { address: "Chakan", village: "Chakan", district: "Pune", state: "Maharashtra", lat: 18.7603, lng: 73.8636 },
      rating: 4.4,
      reviews: 17,
      completed: 44,
      verified: "verified",
      crops: ["Tomato", "Wheat"],
    },
    {
      name: "Vikram Shinde",
      email: "vikram@agrisetu.in",
      farmName: "Shinde Fields",
      loc: { address: "Alandi road", village: "Alandi", district: "Pune", state: "Maharashtra", lat: 18.6772, lng: 73.8965 },
      rating: 4.2,
      reviews: 9,
      completed: 19,
      verified: "pending",
      crops: ["Potato", "Onion", "Rice"],
    },
  ];

  const farmers = [];
  for (const f of farmDefs) {
    const user = await User.create({
      name: f.name,
      email: f.email,
      phone: "98" + Math.floor(Math.random() * 1e8),
      passwordHash: await hash("Farmer@123"),
      role: "farmer",
    });
    const profile = await FarmerProfile.create({
      user: user._id,
      farmName: f.farmName,
      bio: `Family-run farm in ${f.loc.village}. Direct harvest, no mandi detour.`,
      location: f.loc,
      landSizeAcres: 6 + Math.round(Math.random() * 10),
      verificationStatus: f.verified,
      rating: f.rating,
      reviewCount: f.reviews,
      completedOrders: f.completed,
      crops: f.crops,
    });
    farmers.push({ user, profile, def: f });
  }

  const ramesh = farmers[0];
  const sita = farmers[1];
  const arjun = farmers[2];
  const meera = farmers[3];
  const vikram = farmers[4];

  function prod(farmer, name, category, price, qty, image, extra = {}) {
    const loc = farmer.profile.location;
    return Product.create({
      farmer: farmer.user._id,
      farmerProfile: farmer.profile._id,
      name,
      category,
      description: extra.description || `Fresh ${name.toLowerCase()} harvested on farm. Graded and packed at source.`,
      images: [image],
      unit: "kg",
      pricePerUnit: price,
      quantityAvailable: qty,
      harvestDate: extra.harvestDate || new Date(),
      location: { district: loc.district, state: loc.state, lat: loc.lat, lng: loc.lng },
      isActive: true,
    });
  }

  const pTomatoR = await prod(ramesh, "Tomato", "vegetables", 22, 100, IMG.tomato, {
    description: "Hybrid tomatoes, firm, ready for retail and kitchens. Demo listing at ₹22/kg.",
    harvestDate: new Date(),
  });
  await prod(sita, "Tomato", "vegetables", 24, 150, IMG.tomato);
  await prod(arjun, "Tomato", "vegetables", 23, 120, IMG.tomato);
  await prod(meera, "Tomato", "vegetables", 25, 130, IMG.tomato);
  await prod(sita, "Potato", "vegetables", 18, 400, IMG.potato);
  await prod(vikram, "Potato", "vegetables", 16, 220, IMG.potato);
  await prod(ramesh, "Onion", "vegetables", 21, 180, IMG.onion);
  await prod(vikram, "Onion", "vegetables", 20, 90, IMG.onion);
  await prod(meera, "Wheat", "grains", 28, 800, IMG.wheat);
  await prod(arjun, "Mango", "fruits", 85, 60, IMG.mango);
  await prod(vikram, "Rice", "grains", 42, 300, IMG.rice);

  const markets = [
    {
      productName: "Tomato",
      currentPrice: 25,
      historicalAvg: 23,
      demandLevel: "HIGH",
      supplyLevel: "MEDIUM",
      season: "harvest",
      traditional: { farmer: 15, trader: 19, wholesaler: 23, retailer: 30, consumer: 30 },
    },
    {
      productName: "Potato",
      currentPrice: 20,
      historicalAvg: 21,
      demandLevel: "MEDIUM",
      supplyLevel: "HIGH",
      season: "harvest",
      traditional: { farmer: 12, trader: 15, wholesaler: 18, retailer: 24, consumer: 24 },
    },
    {
      productName: "Onion",
      currentPrice: 22,
      historicalAvg: 20,
      demandLevel: "HIGH",
      supplyLevel: "MEDIUM",
      season: "summer",
      traditional: { farmer: 14, trader: 17, wholesaler: 20, retailer: 28, consumer: 28 },
    },
    {
      productName: "Wheat",
      currentPrice: 30,
      historicalAvg: 29,
      demandLevel: "MEDIUM",
      supplyLevel: "MEDIUM",
      season: "harvest",
      traditional: { farmer: 22, trader: 25, wholesaler: 27, retailer: 34, consumer: 34 },
    },
    {
      productName: "Mango",
      currentPrice: 90,
      historicalAvg: 80,
      demandLevel: "HIGH",
      supplyLevel: "LOW",
      season: "summer",
      traditional: { farmer: 50, trader: 62, wholesaler: 75, retailer: 110, consumer: 110 },
    },
    {
      productName: "Rice",
      currentPrice: 45,
      historicalAvg: 44,
      demandLevel: "MEDIUM",
      supplyLevel: "HIGH",
      season: "harvest",
      traditional: { farmer: 32, trader: 36, wholesaler: 40, retailer: 52, consumer: 52 },
    },
  ];

  for (const m of markets) {
    await MarketPrice.create({
      ...m,
      district: "Pune",
      state: "Maharashtra",
      unit: "kg",
      asOf: new Date(),
    });
  }

  for (const name of ["Tomato", "Potato", "Onion"]) {
    const base = markets.find((m) => m.productName === name).historicalAvg;
    for (let d = 90; d >= 0; d -= 5) {
      const noise = Math.sin(d / 8) * 2;
      await PriceHistory.create({
        productName: name,
        district: "Pune",
        date: new Date(Date.now() - d * 86400000),
        mandiPrice: Math.round((base + noise) * 10) / 10,
        directAvgPrice: Math.round((base + noise + 2.5) * 10) / 10,
      });
    }
  }

  const past = await Order.create({
    orderNumber: "AS-DEMO-101",
    buyer: consumer._id,
    farmer: arjun.user._id,
    items: [
      {
        product: pTomatoR._id,
        farmer: arjun.user._id,
        name: "Tomato",
        unit: "kg",
        quantity: 8,
        pricePerUnit: 23,
        lineTotal: 184,
      },
    ],
    status: "DELIVERED",
    subtotal: 184,
    logisticsFee: 30,
    platformFee: 6,
    total: 220,
    paymentStatus: "paid",
    deliveryAddress: { line1: "Koregaon Park", city: "Pune", pincode: "411001", lat: 18.5362, lng: 73.893 },
    statusHistory: [
      { status: "PENDING", at: new Date(Date.now() - 86400000 * 3) },
      { status: "DELIVERED", at: new Date(Date.now() - 86400000 * 2) },
    ],
  });

  await Payment.create({
    order: past._id,
    buyer: consumer._id,
    farmer: arjun.user._id,
    amount: 220,
    method: "demo_upi",
    status: "success",
    reference: "PAY-AS-DEMO-101",
  });

  await Review.create({
    reviewer: consumer._id,
    farmer: arjun.user._id,
    rating: 5,
    comment: "Firm tomatoes, arrived the same evening.",
  });

  await BulkOrder.create({
    buyer: buyer._id,
    productName: "Tomato",
    quantityKg: 500,
    preferredPrice: 24,
    notes: "Weekly store replenishment — graded red tomatoes.",
    status: "open",
    deliveryCity: "Pune",
    deliveryLat: 18.5204,
    deliveryLng: 73.8567,
  });

  await Complaint.create({
    reporter: consumer._id,
    againstUser: vikram.user._id,
    subject: "Photo mismatch on onion lot",
    details: "Listing photo looked greener than received sample. (Seeded demo complaint.)",
    status: "open",
  });

  await Notification.create({
    user: ramesh.user._id,
    title: "Welcome to AgriSetu",
    body: "Add your tomato lot, then open Fair price to see the recommended band.",
    type: "general",
  });
  await Notification.create({
    user: admin._id,
    title: "Farmer pending verification",
    body: "Vikram Shinde is awaiting verification.",
    type: "farmer_signup",
  });

  console.log("Seed complete. Demo logins:");
  console.log("  Farmer     ramesh@agrisetu.in / Farmer@123");
  console.log("  Consumer   ananya@agrisetu.in / Consumer@123");
  console.log("  Buyer      procurement@freshmart.in / Buyer@123");
  console.log("  Admin      admin@agrisetu.in / Admin@123");
}

module.exports = { seedDatabase };

if (require.main === module) {
  connectDb()
    .then(() => seedDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
