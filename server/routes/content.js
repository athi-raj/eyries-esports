const express = require("express");
const Content = require("../models/Content");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/*
  GET /api/content
  -----------------
  Returns the full site content (hero text, founder, co-founders, team,
  achievements, contact info). Any logged-in user (admin or user) can read
  this — it's what the page renders on every screen.
*/
router.get("/", requireAuth, async (req, res) => {
  try {
    let content = await Content.findById("site-content");
    if (!content) {
      // First run: create an empty content document with placeholder text.
      content = await Content.create({ _id: "site-content" });
    }
    res.json(content);
  } catch (err) {
    console.error("Fetch content error:", err);
    res.status(500).json({ error: "Could not load site content." });
  }
});

/*
  PUT /api/content
  -----------------
  Replaces the editable fields of the content document.
  Admin-only — requireAdmin runs after requireAuth, so a regular user
  token is rejected with 403 even if they call this endpoint directly.
  Body shape matches the Content model (hero, founder, coFounders, team,
  achievements, contact) — partial updates are merged in.
*/
router.put("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowedFields = ["hero", "founder", "coFounders", "team", "achievements", "contact"];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const content = await Content.findByIdAndUpdate(
      "site-content",
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json(content);
  } catch (err) {
    console.error("Update content error:", err);
    res.status(500).json({ error: "Could not save changes. Try again." });
  }
});

module.exports = router;
