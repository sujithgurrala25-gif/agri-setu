const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const mongoose = require("mongoose");

async function connectDb() {
  let uri = process.env.MONGODB_URI;
  const wantMemory = process.argv.includes("--demo") || process.env.DEMO_MEMORY === "1";

  if (!wantMemory && uri) {
    try {
      mongoose.set("strictQuery", true);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log("MongoDB connected");
      return { memory: false };
    } catch (err) {
      console.warn("Could not reach MongoDB at MONGODB_URI. Starting in-memory demo database.");
      console.warn(err.message);
    }
  }

  const { MongoMemoryServer } = require("mongodb-memory-server");
  const mongod = await MongoMemoryServer.create();
  uri = mongod.getUri("agrisetu");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("In-memory MongoDB ready (data resets when the API stops)");
  return { memory: true, mongod };
}

module.exports = { connectDb };
