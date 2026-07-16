const jwt = require("jsonwebtoken");
const pool = require("../db");

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token provided" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Allows E1, or a designated backup approver, to proceed
async function requireE1(req, res, next) {
  if (req.user?.role === "e1") return next();

  try {
    const { rows } = await pool.query(
      "SELECT is_backup_approver FROM users WHERE id = $1",
      [req.user.id]
    );
    if (rows[0]?.is_backup_approver) return next();
  } catch {
    // fall through to reject below
  }

  return res.status(403).json({ error: "E1 access required" });
}

module.exports = { authenticate, requireE1 };
