import express from "express";
import { requireAuth } from "./auth.js";
import User from "../models/User.js";


const router = express.Router();

// GET /api/accounts — get all schedules/accounts for the logged-in user
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    res.json({
      accounts: user.accounts || [],
      currentAccountId: user.currentAccountId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// POST /api/accounts — add a new schedule/account
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "name and email required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const newAccount = { name, email };
    user.accounts.push(newAccount);

    // set currentAccountId if none exists
    if (!user.currentAccountId) user.currentAccountId = user.accounts[user.accounts.length - 1]._id;

    await user.save();
    res.status(201).json(user.accounts[user.accounts.length - 1]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// DELETE /api/accounts/:id — remove a schedule/account
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const idx = user.accounts.findIndex(a => a._id.toString() === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "account not found" });

    const removed = user.accounts.splice(idx, 1)[0];
    if (user.currentAccountId?.toString() === removed._id.toString()) {
      user.currentAccountId = user.accounts.length ? user.accounts[0]._id : null;
    }

    await user.save();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// PUT /api/accounts/:id/current — switch current schedule/account
router.put("/:id/current", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    const account = user.accounts.id(req.params.id);
    if (!account) return res.status(404).json({ error: "account not found" });

    user.currentAccountId = account._id;
    await user.save();
    res.json({ currentAccountId: account._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
