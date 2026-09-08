// Fallback mock data and simulated API handlers for zero-backend deployments (e.g., Vercel)
// This ensures presentations work smoothly even when the cloud API server is not running.

const DEMO_USERS = [
  {
    id: "user-ramesh",
    name: "Ramesh Kale",
    email: "ramesh@agrisetu.in",
    role: "farmer",
    phone: "9876543210",
    farmProfile: {
      user: "user-ramesh",
      farmName: "Kale Organic Farm",
      bio: "Family-run farm in Wagholi. Direct harvest, no mandi detour.",
      location: { address: "Near Wagholi", village: "Wagholi", district: "Pune", state: "Maharashtra", lat: 18.5806, lng: 73.9832 },
      landSizeAcres: 8,
      verificationStatus: "verified",
      rating: 4.7,
      reviewCount: 38,
      completedOrders: 126,
      crops: ["Tomato", "Onion"],
    }
  },
  {
    id: "user-ananya",
    name: "Ananya Shah",
    email: "ananya@agrisetu.in",
    role: "consumer",
    phone: "9876500001",
  },
  {
    id: "user-buyer",
    name: "Priya Nair",
    email: "procurement@freshmart.in",
    role: "institutional",
    phone: "9876500002",
    orgName: "FreshMart Supermarkets",
    orgType: "supermarket",
  },
  {
    id: "user-admin",
    name: "Platform Admin",
    email: "admin@agrisetu.in",
    role: "admin",
    phone: "0200000001",
  }
];

const DEMO_PRODUCTS = [
  {
    _id: "prod-1",
    name: "Fresh Hybrid Tomatoes",
    category: "vegetables",
    description: "Vine-ripened, firm tomatoes. Graded A, harvested daily.",
    pricePerKg: 22,
    quantityAvailableKg: 350,
    minOrderKg: 5,
    unit: "kg",
    harvestDate: new Date().toISOString(),
    images: ["https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800&q=80"],
    isActive: true,
    farmer: {
      _id: "farmer-ramesh",
      user: { _id: "user-ramesh", name: "Ramesh Kale", phone: "9876543210" },
      farmName: "Kale Organic Farm",
      rating: 4.7,
      reviewCount: 38,
      verificationStatus: "verified",
      location: { district: "Pune", state: "Maharashtra", village: "Wagholi", lat: 18.5806, lng: 73.9832 }
    }
  },
  {
    _id: "prod-2",
    name: "Red Nashik Onions",
    category: "vegetables",
    description: "Medium pungent, well-cured onions with thin dry outer skin.",
    pricePerKg: 28,
    quantityAvailableKg: 600,
    minOrderKg: 10,
    unit: "kg",
    harvestDate: new Date().toISOString(),
    images: ["https://images.unsplash.com/photo-1508747703725-71977763739e?w=800&q=80"],
    isActive: true,
    farmer: {
      _id: "farmer-ramesh",
      user: { _id: "user-ramesh", name: "Ramesh Kale", phone: "9876543210" },
      farmName: "Kale Organic Farm",
      rating: 4.7,
      reviewCount: 38,
      verificationStatus: "verified",
      location: { district: "Pune", state: "Maharashtra", village: "Wagholi", lat: 18.5806, lng: 73.9832 }
    }
  },
  {
    _id: "prod-3",
    name: "Fresh Farm Potatoes",
    category: "vegetables",
    description: "Firm table potatoes, low soil cling, excellent shelf life.",
    pricePerKg: 18,
    quantityAvailableKg: 450,
    minOrderKg: 5,
    unit: "kg",
    harvestDate: new Date().toISOString(),
    images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80"],
    isActive: true,
    farmer: {
      _id: "farmer-sita",
      user: { _id: "user-sita", name: "Sita Patil", phone: "9876500003" },
      farmName: "Patil Family Farms",
      rating: 4.5,
      reviewCount: 22,
      verificationStatus: "verified",
      location: { district: "Pune", state: "Maharashtra", village: "Hadapsar", lat: 18.5089, lng: 73.926 }
    }
  },
  {
    _id: "prod-4",
    name: "Ratnagiri Alphonso Mangoes",
    category: "fruits",
    description: "Naturally ripened GI-tagged Alphonso mangoes, sweet and aromatic.",
    pricePerKg: 120,
    quantityAvailableKg: 180,
    minOrderKg: 2,
    unit: "kg",
    harvestDate: new Date().toISOString(),
    images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80"],
    isActive: true,
    farmer: {
      _id: "farmer-arjun",
      user: { _id: "user-arjun", name: "Arjun Deshmukh", phone: "9876500004" },
      farmName: "Deshmukh Produce",
      rating: 4.8,
      reviewCount: 51,
      verificationStatus: "verified",
      location: { district: "Pune", state: "Maharashtra", village: "Pirangut", lat: 18.51, lng: 73.68 }
    }
  }
];

const DEMO_ORDERS = [
  {
    _id: "ord-101",
    orderNumber: "AGRI-2024-001",
    status: "ACCEPTED",
    totalAmount: 440,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: [
      { product: { name: "Fresh Hybrid Tomatoes", pricePerKg: 22 }, quantityKg: 20, pricePerKg: 22, subtotal: 440 }
    ],
    buyer: { name: "Ananya Shah", phone: "9876500001", role: "consumer" },
    farmer: { _id: "farmer-ramesh", farmName: "Kale Organic Farm" },
    delivery: { status: "IN_TRANSIT", etaHours: 2 }
  },
  {
    _id: "ord-102",
    orderNumber: "AGRI-2024-002",
    status: "PENDING",
    totalAmount: 1100,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    items: [
      { product: { name: "Fresh Hybrid Tomatoes", pricePerKg: 22 }, quantityKg: 50, pricePerKg: 22, subtotal: 1100 }
    ],
    buyer: { name: "FreshMart Supermarkets", phone: "9876500002", role: "institutional" },
    farmer: { _id: "farmer-ramesh", farmName: "Kale Organic Farm" }
  }
];

export function handleMockApi(config) {
  const url = (config.url || "").replace(/^.*\/api/, "").replace(/^\//, "");
  const method = (config.method || "get").toLowerCase();
  let body = {};
  try {
    body = typeof config.data === "string" ? JSON.parse(config.data) : config.data || {};
  } catch {}

  // 1. Auth: Login
  if (url === "auth/login" && method === "post") {
    const email = (body.email || "").toLowerCase().trim();
    let user = DEMO_USERS.find((u) => u.email.toLowerCase() === email);
    if (!user) {
      user = {
        id: "user-" + Date.now(),
        name: email.split("@")[0],
        email,
        role: "farmer",
        farmProfile: { farmName: "My Farm", verificationStatus: "verified", rating: 5.0 }
      };
    }
    localStorage.setItem("agrisetu_token", "demo-token-" + user.id);
    localStorage.setItem("agrisetu_current_user", JSON.stringify(user));
    return { status: 200, data: { token: "demo-token-" + user.id, user } };
  }

  // 2. Auth: Register
  if (url === "auth/register" && method === "post") {
    const user = {
      id: "user-" + Date.now(),
      name: body.name || "User",
      email: (body.email || "demo@agrisetu.in").toLowerCase(),
      role: body.role || "farmer",
      phone: body.phone || "9876543210",
      orgName: body.orgName || null,
      orgType: body.orgType || null,
      farmProfile: body.role === "farmer" ? {
        farmName: body.farmName || `${body.name}'s Farm`,
        verificationStatus: "verified",
        rating: 5.0,
        location: body.location || { district: "Pune", state: "Maharashtra", lat: 18.52, lng: 73.85 }
      } : null
    };
    localStorage.setItem("agrisetu_token", "demo-token-" + user.id);
    localStorage.setItem("agrisetu_current_user", JSON.stringify(user));
    return { status: 201, data: { token: "demo-token-" + user.id, user } };
  }

  // 3. Auth: Current User / Me
  if (url === "auth/me" && method === "get") {
    const saved = localStorage.getItem("agrisetu_current_user");
    const user = saved ? JSON.parse(saved) : DEMO_USERS[0];
    return {
      status: 200,
      data: {
        user,
        farmerProfile: user.farmProfile || (user.role === "farmer" ? DEMO_USERS[0].farmProfile : null)
      }
    };
  }

  // 4. Products list
  if (url === "products" || url.startsWith("products?")) {
    return {
      status: 200,
      data: {
        products: DEMO_PRODUCTS,
        total: DEMO_PRODUCTS.length,
        categories: ["vegetables", "fruits", "grains"]
      }
    };
  }

  // 5. Single product
  if (url.startsWith("products/")) {
    const prod = DEMO_PRODUCTS[0];
    return {
      status: 200,
      data: {
        product: prod,
        transparency: {
          traditionalRetailPrice: 38,
          farmerShareTraditional: 42,
          agrisetuDirectPrice: 24,
          farmerShareDirect: 88,
          savingsForBuyerPercent: 36
        }
      }
    };
  }

  // 6. Farmer earnings
  if (url === "farmer/earnings") {
    return {
      status: 200,
      data: {
        grossEarnings: 32400,
        pendingPayout: 4200,
        completedOrdersCount: 28,
        recentEarnings: [
          { date: "Day 1", amount: 4800 },
          { date: "Day 2", amount: 6200 },
          { date: "Day 3", amount: 5100 },
          { date: "Day 4", amount: 7900 },
          { date: "Day 5", amount: 8400 }
        ]
      }
    };
  }

  // 7. Orders list
  if (url === "orders" || url.startsWith("orders?")) {
    return { status: 200, data: { orders: DEMO_ORDERS } };
  }

  // 8. Farmer products
  if (url === "farmers/me/products") {
    return { status: 200, data: { products: DEMO_PRODUCTS.slice(0, 2) } };
  }

  // 9. Pricing recommendation
  if (url === "pricing/recommend") {
    const p = Number(body.listedPrice) || 22;
    return {
      status: 200,
      data: {
        recommendedMin: Math.max(15, Math.round(p * 0.95)),
        recommendedMax: Math.round(p * 1.15),
        confidence: "High",
        mandiPrice: p - 2,
        demandIntensity: "High",
        factors: [
          { name: "Current Mandi Modal Price", impact: "Baseline anchor at ₹" + (p - 2) + "/kg" },
          { name: "Local Harvest Supply", impact: "Moderate local supply in Pune district (+₹1.50/kg)" },
          { name: "Direct Consumer Demand", impact: "Strong buyer search volume (+₹2.00/kg)" }
        ]
      }
    };
  }

  // 10. Pricing history
  if (url.startsWith("pricing/history")) {
    return {
      status: 200,
      data: {
        history: [
          { date: "Week 1", price: 20 },
          { date: "Week 2", price: 22 },
          { date: "Week 3", price: 21 },
          { date: "Week 4", price: 24 }
        ]
      }
    };
  }

  // 11. Bulk RFQs
  if (url === "bulk" || url.startsWith("bulk?")) {
    return {
      status: 200,
      data: {
        bulks: [
          {
            _id: "bulk-1",
            productName: "Tomato",
            targetQuantityKg: 500,
            maxBudgetPerKg: 24,
            status: "MATCHED",
            allocations: [
              { farmerName: "Ramesh Kale", quantityKg: 200, pricePerKg: 22, status: "accepted" },
              { farmerName: "Sita Patil", quantityKg: 150, pricePerKg: 23, status: "accepted" },
              { farmerName: "Arjun Deshmukh", quantityKg: 150, pricePerKg: 23, status: "pending" }
            ]
          }
        ]
      }
    };
  }

  // 12. Admin stats
  if (url === "analytics/admin") {
    return {
      status: 200,
      data: {
        totalFarmers: 142,
        totalConsumers: 1850,
        totalOrders: 324,
        totalGmv: 485000,
        verifiedFarmersPercent: 88
      }
    };
  }

  // 13. Admin users & farmers
  if (url === "admin/users") {
    return { status: 200, data: { users: DEMO_USERS } };
  }
  if (url === "admin/farmers") {
    return {
      status: 200,
      data: {
        farmers: DEMO_USERS.filter((u) => u.role === "farmer").map((u) => ({
          _id: u.id,
          user: u,
          farmName: u.farmProfile?.farmName || "Organic Farm",
          verificationStatus: "verified",
          rating: 4.8
        }))
      }
    };
  }

  // 14. Notifications
  if (url === "notifications") {
    return {
      status: 200,
      data: {
        notifications: [
          { _id: "notif-1", title: "New order received", body: "Ananya placed order for 20kg Tomatoes", read: false },
          { _id: "notif-2", title: "Price update", body: "Tomato mandi rate increased by ₹2/kg today", read: true }
        ],
        unread: 1
      }
    };
  }

  // Default fallback for any other GET/POST
  return { status: 200, data: { ok: true, message: "Demo simulated response" } };
}
