const router = require("express").Router();
const pool = require("../db");
const { authenticate, requireE1 } = require("../middleware/auth");
const { logAudit } = require("../utils/auditLog");

// GET /api/retention/employees?year=2025-26 — list employee rows for a year (for checkbox selection)
router.get("/employees", authenticate, requireE1, async (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: "year query param required" });
  try {
    const { rows } = await pool.query(
      "SELECT cpf, name, designation, financial_year FROM employees WHERE financial_year = $1 ORDER BY name",
      [year]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/retention/requests?year=2025-26 — list access requests within a financial year (for checkbox selection)
router.get("/requests", authenticate, requireE1, async (req, res) => {
  const { year } = req.query;
  const match = /^(\d{4})-(\d{2})$/.exec(year || "");
  if (!match) return res.status(400).json({ error: "Invalid year format, expected e.g. 2024-25" });

  const startYear = parseInt(match[1], 10);
  const endYear = startYear + 1;
  const start = `${startYear}-04-01`;
  const end = `${endYear}-03-31`;

  try {
    const { rows } = await pool.query(
      "SELECT id, employee_name, cpf_no, status, request_date FROM access_requests WHERE request_date BETWEEN $1 AND $2 ORDER BY request_date DESC",
      [start, end]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/retention/employees/delete — body: { cpfs: ["12345", ...], year: "2025-26" }
router.post("/employees/delete", authenticate, requireE1, async (req, res) => {
  const { cpfs, year } = req.body;
  if (!Array.isArray(cpfs) || cpfs.length === 0 || !year) {
    return res.status(400).json({ error: "cpfs (array) and year are required" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM employees WHERE financial_year = $1 AND cpf = ANY($2::text[])",
      [year, cpfs]
    );

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: "employees_deleted",
      targetType: "financial_year",
      targetId: year,
      details: `Deleted ${result.rowCount} selected employee record(s) for FY ${year}: CPFs ${cpfs.join(", ")}`,
    });

    res.json({ message: `Deleted ${result.rowCount} employee record(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/retention/requests/delete — body: { ids: [1, 2, 3], year: "2025-26" }
router.post("/requests/delete", authenticate, requireE1, async (req, res) => {
  const { ids, year } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids (array) required" });
  }
  try {
    const result = await pool.query(
      "DELETE FROM access_requests WHERE id = ANY($1::int[])",
      [ids]
    );

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: "requests_deleted",
      targetType: "financial_year",
      targetId: year || "unknown",
      details: `Deleted ${result.rowCount} selected access request(s): IDs ${ids.join(", ")}`,
    });

    res.json({ message: `Deleted ${result.rowCount} access request(s)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
