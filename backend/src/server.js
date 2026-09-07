const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDb } = require("./config/db");
const { apiRouter, absUpload } = require("./routes");
const { errorHandler } = require("./middleware/error");
const { seedDatabase } = require("./seed/seed");

const app = express();
const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(absUpload));
app.use("/api", apiRouter());

app.get("/health", (_req, res) => res.json({ ok: true, service: "agrisetu-api" }));
app.use(errorHandler);

const port = Number(process.env.PORT) || 5000;

connectDb()
  .then(async (info) => {
    const User = require("./models/User");
    const count = await User.countDocuments();
    if (info.memory || count === 0) {
      console.log("Database empty or in-memory: seeding demo data...");
      await seedDatabase();
    }
    app.listen(port, "0.0.0.0", () => console.log(`AgriSetu API on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
