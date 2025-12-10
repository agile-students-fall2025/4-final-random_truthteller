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

//allowed NYU domains
const NYU_REGEX = /^.+@(nyu\.edu|stern\.nyu\.edu)$/i;

//validate email domain
function validateNYUEmail(email) {
  return NYU_REGEX.test(email);
}

//password validation
function validatePassword(password) {
  const errors = [];

  if (password.length < 8)
    errors.push("Password must be at least 8 characters");

  if (!/[A-Z]/.test(password))
    errors.push("Password must contain at least one uppercase letter");

  if (!/[0-9]/.test(password))
    errors.push("Password must contain at least one number");

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password))
    errors.push("Password must contain at least one symbol");

  return errors;
}

//REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    if (!validateNYUEmail(email))
      return res.status(400).json({
        error: "Only @nyu.edu and @stern.nyu.edu emails are allowed",
      });

    const errors = validatePassword(password);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

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

    const token = generateToken({ userId: user._id, email: user.email });

    return res.status(201).json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Register error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

//login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    if (!validateNYUEmail(email))
      return res.status(400).json({
        error: "Only @nyu.edu and @stern.nyu.edu emails are allowed",
      });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken({ userId: user._id, email: user.email });

    return res.json({
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error("Login error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

router.post("/logout", (req, res) => {
  const auth = req.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token) tokenBlacklist.add(token);
  res.status(204).send();
});

function requireAuth(req, res, next) {
  const auth = req.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");

  if (!token) return res.status(401).json({ error: "Missing token" });
  if (tokenBlacklist.has(token))
    return res.status(401).json({ error: "Token invalidated" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}


router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (!currentPassword || !newPassword)
      return res.status(400).json({
        error: "currentPassword and newPassword required",
      });

    const errors = validatePassword(newPassword);
    if (errors.length > 0)
      return res.status(400).json({ errors });

    const user = await User.findById(req.auth.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok)
      return res
        .status(401)
        .json({ error: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    console.error("change-password error", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
export { requireAuth, tokenBlacklist };
