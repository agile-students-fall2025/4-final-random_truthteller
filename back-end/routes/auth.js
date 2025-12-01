import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

const tokenBlacklist = new Set();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const TOKEN_EXPIRES_IN = "2h";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    // Check if email already exists
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Use ObjectId for accounts and currentAccountId
    const accountId = new mongoose.Types.ObjectId();

    const user = await User.create({
      email,
      passwordHash,
      accounts: [
        {
          _id: accountId,
          email,
          name: email,
        },
      ],
      currentAccountId: accountId,
    });

    const token = generateToken({ userId: user._id });

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Register error", err);
    res.status(500).json({ error: "internal error" });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = generateToken({ userId: user._id });

    res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "internal error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  const auth = req.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token) tokenBlacklist.add(token);
  res.status(204).send();
});

// AUTH MIDDLEWARE
function requireAuth(req, res, next) {
  const auth = req.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "missing token" });
  if (tokenBlacklist.has(token))
    return res.status(401).json({ error: "token invalidated" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "invalid token" });
  }
}

// CHANGE PASSWORD
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });

    const user = await User.findById(req.auth.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: "current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    console.error("change-password error", err);
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;
export { requireAuth, tokenBlacklist };
