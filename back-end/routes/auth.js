import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// In-memory users store (replace with DB in production)
// Structure: { userId: { id, email, passwordHash, accounts: [{id, email, name}], currentAccountId } }
const users = Object.create(null);

// Simple token blacklist for logout (in-memory)
const tokenBlacklist = new Set();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";
const TOKEN_EXPIRES_IN = "2h";

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

// Register: POST /api/auth/register { email, password }
router.post("/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  // naive email uniqueness check
  for (const u of Object.values(users)) {
    if (u.email === email)
      return res.status(409).json({ error: "email already registered" });
  }

  const id = `u-${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 8);
  users[id] = {
    id,
    email,
    passwordHash,
    accounts: [{ id: `a-${id}-1`, email, name: email }],
    currentAccountId: `a-${id}-1`,
  };

  const token = generateToken({ userId: id });
  res.status(201).json({ token, user: { id, email } });
});

// Login: POST /api/auth/login { email, password }
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const user = Object.values(users).find((u) => u.email === email);
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const token = generateToken({ userId: user.id });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Logout: POST /api/auth/logout { token in Authorization header }
router.post("/logout", (req, res) => {
  const auth = req.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (token) tokenBlacklist.add(token);
  res.status(204).send();
});

// Middleware to protect routes
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

// Change password: POST /api/auth/change-password { currentPassword, newPassword }
router.post("/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "currentPassword and newPassword are required" });
    }

    const userId = req.auth && req.auth.userId;
    const user = users[userId];
    if (!user) return res.status(404).json({ error: "user not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: "current password is incorrect" });

    const newHash = await bcrypt.hash(newPassword, 8);
    user.passwordHash = newHash;

    // Optionally invalidate existing tokens by clearing blacklist or using token versioning.
    // For now, just respond success.
    return res.json({ ok: true });
  } catch (err) {
    console.error("change-password error", err);
    return res.status(500).json({ error: "internal error" });
  }
});

export default router;
export { users, requireAuth, tokenBlacklist };
