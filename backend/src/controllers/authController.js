const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const FarmerProfile = require("../models/FarmerProfile");
const { signToken, publicUser } = require("../utils/authTokens");
const { notify } = require("../services/notify");

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    return false;
  }
  return true;
}

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["farmer", "consumer", "institutional"]).withMessage("Invalid role"),
];

async function register(req, res, next) {
  try {
    if (!validate(req, res)) return;
    const { name, email, password, role, phone, farmName, orgName, orgType, location } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role,
      orgName,
      orgType: orgType || null,
    });

    if (role === "farmer") {
      await FarmerProfile.create({
        user: user._id,
        farmName: farmName || `${name}'s Farm`,
        location: location || {},
        verificationStatus: "pending",
      });
      const admins = await User.find({ role: "admin" }).select("_id");
      await Promise.all(
        admins.map((a) =>
          notify(a._id, {
            title: "New farmer registration",
            body: `${name} registered and awaits verification.`,
            type: "farmer_signup",
          })
        )
      );
    }

    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

const loginRules = [
  body("email").isEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

async function login(req, res, next) {
  try {
    if (!validate(req, res)) return;
    const user = await User.findOne({ email: req.body.email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });
    const ok = await bcrypt.compare(req.body.password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    let farmerProfile = null;
    if (req.user.role === "farmer") {
      farmerProfile = await FarmerProfile.findOne({ user: req.user._id });
    }
    res.json({ user: publicUser(req.user), farmerProfile });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const { name, phone, orgName } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (orgName !== undefined) req.user.orgName = orgName;
    await req.user.save();

    if (req.user.role === "farmer" && req.body.farmerProfile) {
      const profile = await FarmerProfile.findOne({ user: req.user._id });
      if (profile) {
        const p = req.body.farmerProfile;
        if (p.farmName) profile.farmName = p.farmName;
        if (p.bio !== undefined) profile.bio = p.bio;
        if (p.landSizeAcres !== undefined) profile.landSizeAcres = p.landSizeAcres;
        if (p.location) profile.location = { ...profile.location, ...p.location };
        await profile.save();
      }
    }
    res.json({ user: publicUser(req.user) });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, registerRules, login, loginRules, me, updateMe };
