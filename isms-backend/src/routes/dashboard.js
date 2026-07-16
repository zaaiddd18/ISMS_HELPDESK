const router = require("express").Router();
const pool = require("../db");
const { authenticate } = require("../middleware/auth");

// Converts "2025-26" -> { start: "2025-04-01", end: "2026-03-31" }
function yearToRange(year) {
  const match = /^(\d{4})-(\d{2})$/.exec(year);
  if (!match) return null;
  const startYear = parseInt(match[1], 10);
  const endYear = startYear + 1;
  return {
    start: `${startYear}-04-01`,
    end: `${endYear}-03-31`,
  };
}

// GET /api/dashboard/stats?year=2025-26
router.get("/stats", authenticate, async (req, res) => {
  const year = (req.query.year || "").trim();
  const range = year ? yearToRange(year) : null;

  try {
    let pending, approved, rejected;

    if (range) {
      pending = await pool.query(
        `SELECT COUNT(*) FROM access_requests WHERE status = 'pending' AND request_date BETWEEN $1 AND $2`,
        [range.start, range.end]
      );
      approved = await pool.query(
        `SELECT COUNT(*) FROM access_requests WHERE status = 'approved' AND request_date BETWEEN $1 AND $2`,
        [range.start, range.end]
      );
      rejected = await pool.query(
        `SELECT COUNT(*) FROM access_requests WHERE status = 'rejected' AND request_date BETWEEN $1 AND $2`,
        [range.start, range.end]
      );
    } else {
      pending = await pool.query(`SELECT COUNT(*) FROM access_requests WHERE status = 'pending'`);
      approved = await pool.query(`SELECT COUNT(*) FROM access_requests WHERE status = 'approved'`);
      rejected = await pool.query(`SELECT COUNT(*) FROM access_requests WHERE status = 'rejected'`);
    }

    let employeeCount = 0;
    if (year) {
      const emp = await pool.query(
        `SELECT COUNT(*) FROM employees WHERE financial_year = $1 AND is_active = true`,
        [year]
      );
      employeeCount = parseInt(emp.rows[0].count, 10);
    }

    res.json({
      pending: parseInt(pending.rows[0].count, 10),
      approved: parseInt(approved.rows[0].count, 10),
      rejected: parseInt(rejected.rows[0].count, 10),
      employees: employeeCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
