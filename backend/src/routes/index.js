const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { auth, requireRole, optionalAuth } = require("../middleware/auth");
const authCtrl = require("../controllers/authController");
const productCtrl = require("../controllers/productController");
const orderCtrl = require("../controllers/orderController");
const pricingCtrl = require("../controllers/pricingController");
const analyticsCtrl = require("../controllers/analyticsController");
const bulkCtrl = require("../controllers/bulkController");
const adminCtrl = require("../controllers/adminController");
const reviewCtrl = require("../controllers/reviewController");
const notifCtrl = require("../controllers/notificationController");

const uploadDir = process.env.UPLOAD_DIR || "uploads";
const absUpload = path.join(process.cwd(), uploadDir);
fs.mkdirSync(absUpload, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, absUpload),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`),
});
const upload = multer({ storage, limits: { fileSize: 4 * 1024 * 1024 } });

function apiRouter() {
  const r = express.Router();

  r.get("/docs", (_req, res) => {
    res.json({
      name: "AgriSetu API",
      endpoints: {
        auth: ["POST /auth/register", "POST /auth/login", "GET /auth/me", "PATCH /auth/me"],
        products: [
          "GET /products",
          "GET /products/nearby",
          "GET /products/:id",
          "POST /products",
          "PATCH /products/:id",
          "GET /farmers/me/products",
          "GET /farmers/:userId",
        ],
        orders: ["POST /orders", "GET /orders", "GET /orders/:id", "PATCH /orders/:id/status", "GET /farmer/earnings"],
        pricing: ["POST /pricing/recommend", "GET /pricing/market", "GET /pricing/history"],
        analytics: ["GET /analytics/farmer", "GET /analytics/admin"],
        bulk: ["POST /bulk", "GET /bulk", "POST /bulk/:id/match", "POST /bulk/:id/accept"],
        reviews: ["POST /reviews", "GET /reviews"],
        notifications: ["GET /notifications", "PATCH /notifications/:id"],
        admin: [
          "GET /admin/users",
          "GET /admin/farmers",
          "POST /admin/farmers/:userId/verify",
          "GET /admin/products",
          "GET /admin/payments",
          "GET /admin/complaints",
          "GET /admin/flags",
        ],
      },
    });
  });

  r.post("/auth/register", authCtrl.registerRules, authCtrl.register);
  r.post("/auth/login", authCtrl.loginRules, authCtrl.login);
  r.get("/auth/me", auth, authCtrl.me);
  r.patch("/auth/me", auth, authCtrl.updateMe);

  r.get("/products", optionalAuth, productCtrl.listProducts);
  r.get("/products/nearby", optionalAuth, productCtrl.nearbyFarmers);
  r.get("/products/:id", optionalAuth, productCtrl.getProduct);
  r.post("/products", auth, requireRole("farmer"), upload.array("images", 4), productCtrl.createProduct);
  r.patch("/products/:id", auth, requireRole("farmer"), upload.array("images", 4), productCtrl.updateProduct);
  r.get("/farmers/me/products", auth, requireRole("farmer"), productCtrl.myProducts);
  r.get("/farmers/:userId", productCtrl.farmerPublic);

  r.post("/orders", auth, requireRole("consumer", "institutional"), orderCtrl.createOrder);
  r.get("/orders", auth, orderCtrl.listOrders);
  r.get("/orders/:id", auth, orderCtrl.getOrder);
  r.patch("/orders/:id/status", auth, orderCtrl.updateStatus);
  r.get("/farmer/earnings", auth, requireRole("farmer"), orderCtrl.earnings);

  r.post("/pricing/recommend", auth, pricingCtrl.recommend);
  r.get("/pricing/market", pricingCtrl.market);
  r.get("/pricing/history", pricingCtrl.history);

  r.get("/analytics/farmer", auth, requireRole("farmer"), analyticsCtrl.farmerAnalytics);
  r.get("/analytics/admin", auth, requireRole("admin"), analyticsCtrl.adminStats);

  r.post("/bulk", auth, requireRole("institutional", "admin"), bulkCtrl.createBulk);
  r.get("/bulk", auth, bulkCtrl.listBulk);
  r.post("/bulk/:id/match", auth, bulkCtrl.matchBulk);
  r.post("/bulk/:id/accept", auth, bulkCtrl.acceptAllocation);

  r.post("/reviews", auth, reviewCtrl.createReview);
  r.get("/reviews", reviewCtrl.listReviews);

  r.get("/notifications", auth, notifCtrl.list);
  r.patch("/notifications/:id", auth, notifCtrl.markRead);
  r.post("/notifications/read-all", auth, (req, res, next) => {
    req.body.all = true;
    notifCtrl.markRead(req, res, next);
  });

  r.post("/complaints", auth, adminCtrl.createComplaint);

  r.get("/admin/users", auth, requireRole("admin"), adminCtrl.users);
  r.get("/admin/farmers", auth, requireRole("admin"), adminCtrl.farmers);
  r.post("/admin/farmers/:userId/verify", auth, requireRole("admin"), adminCtrl.verifyFarmer);
  r.get("/admin/products", auth, requireRole("admin"), adminCtrl.products);
  r.patch("/admin/products/:id", auth, requireRole("admin"), adminCtrl.toggleProduct);
  r.get("/admin/payments", auth, requireRole("admin"), adminCtrl.payments);
  r.get("/admin/complaints", auth, requireRole("admin"), adminCtrl.complaints);
  r.patch("/admin/complaints/:id", auth, requireRole("admin"), adminCtrl.updateComplaint);
  r.get("/admin/flags", auth, requireRole("admin"), adminCtrl.riskFlags);
  r.get("/admin/orders", auth, requireRole("admin"), orderCtrl.listOrders);

  return r;
}

module.exports = { apiRouter, absUpload };
