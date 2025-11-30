import express from "express";
import { users, requireAuth } from "./auth.js";

const router = express.Router();

// Helper: get user object from auth payload
function getUserFromReq(req) {
  const userId = req.auth && req.auth.userId;
  if (!userId) return null;
  return users[userId] || null;
}

// Get accounts: GET /api/accounts
router.get("/", requireAuth, (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(404).json({ error: "user not found" });
  res.json({
    accounts: user.accounts || [],
    currentAccountId: user.currentAccountId || null,
  });
});

// Add an account: POST /api/accounts { email, name }
router.post("/", requireAuth, (req, res) => {
  const { email, name } = req.body || {};
  if (!email) return res.status(400).json({ error: "email required" });

  const user = getUserFromReq(req);
  if (!user) return res.status(404).json({ error: "user not found" });

  const accountId = `a-${user.id}-${Date.now()}`;
  const account = { id: accountId, email, name: name || email };
  user.accounts = user.accounts || [];
  user.accounts.push(account);
  // if no current account set, set it
  if (!user.currentAccountId) user.currentAccountId = accountId;

  res.status(201).json(account);
});

// Delete an account: DELETE /api/accounts/:id
router.delete("/:id", requireAuth, (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(404).json({ error: "user not found" });

  const idx = (user.accounts || []).findIndex((a) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "account not found" });

  const removed = user.accounts.splice(idx, 1)[0];
  if (user.currentAccountId === removed.id) {
    user.currentAccountId = user.accounts.length ? user.accounts[0].id : null;
  }

  res.status(204).send();
});

// Switch current account: PUT /api/accounts/:id/current
router.put("/:id/current", requireAuth, (req, res) => {
  const user = getUserFromReq(req);
  if (!user) return res.status(404).json({ error: "user not found" });

  const acc = (user.accounts || []).find((a) => a.id === req.params.id);
  if (!acc) return res.status(404).json({ error: "account not found" });

  user.currentAccountId = acc.id;
  res.json({ currentAccountId: acc.id });
});

export default router;
