const router = require("express").Router();
const pool = require("../db");
const { authenticate } = require("../middleware/auth");

function dateToFinancialYear(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const startYear = month >= 4 ? year : year - 1;
  const endYear = (startYear + 1).toString().slice(-2);
  return `${startYear}-${endYear}`;
}

router.get("/years", authenticate, async (req, res) => {
  try {
    const empYears = await pool.query(`SELECT DISTINCT financial_year FROM employees`);
    const reqDates = await pool.query(`SELECT DISTINCT request_date FROM access_requests WHERE request_date IS NOT NULL`);

    const yearSet = new Set(empYears.rows.map((r) => r.financial_year));
    reqDates.rows.forEach((r) => yearSet.add(dateToFinancialYear(r.request_date)));

    const years = Array.from(yearSet).sort().reverse();
    res.json(years);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", authenticate, async (req, res) => {
  const q = (req.query.q || "").trim();
  const year = (req.query.year || "").trim();
  if (q.length < 1) return res.json([]);

  try {
    let query, params;
    if (year) {
      query = `SELECT cpf, name, designation, financial_year
                FROM employees
                WHERE is_active = true AND financial_year = $1 AND (cpf ILIKE $2 OR name ILIKE $2)
                ORDER BY name LIMIT 15`;
      params = [year, `%${q}%`];
    } else {
      query = `SELECT DISTINCT ON (cpf) cpf, name, designation, financial_year
                FROM employees
                WHERE is_active = true AND (cpf ILIKE $1 OR name ILIKE $1)
                ORDER BY cpf, financial_year DESC LIMIT 15`;
      params = [`%${q}%`];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
