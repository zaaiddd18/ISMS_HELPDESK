const router = require("express").Router();
const pool = require("../db");
const { authenticate, requireE1 } = require("../middleware/auth");

// GET /api/audit-logs — E1 only, most recent first
router.get("/", authenticate, requireE1, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
