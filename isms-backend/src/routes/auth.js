const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const pool = require("../db");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { error: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

function validatePasswordStrength(password) {
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
}

router.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username and password required" });

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.is_approved) {
      return res.status(403).json({ error: "Your account is pending E1 approval. Please contact your administrator." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/e1-exists", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id FROM users WHERE role = 'e1'");
    res.json({ exists: rows.length > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { username, password, full_name, role } = req.body;
  if (!username || !password || !full_name)
    return res.status(400).json({ error: "Username, full name and password are required" });

  const passwordError = validatePasswordStrength(password);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const allowedRoles = ["e1", "e2", "e3"];
  let finalRole = allowedRoles.includes(role) ? role : "e2";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows[0])
      return res.status(409).json({ error: "Username already taken" });

    if (finalRole === "e1") {
      const e1Check = await pool.query("SELECT id FROM users WHERE role = 'e1'");
      if (e1Check.rows.length > 0) {
        return res.status(409).json({ error: "An E1 account already exists. Only one E1 account is permitted." });
      }
    }

    // E1 accounts are auto-approved (first admin); everyone else needs E1 sign-off
    const isApproved = finalRole === "e1";

    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (username, password_hash, full_name, role, is_approved)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, username, full_name, role, is_approved`,
      [username, password_hash, full_name, finalRole, isApproved]
    );
    res.status(201).json({
      message: isApproved
        ? "Account created successfully"
        : "Account created. An E1 administrator must approve it before you can sign in.",
      user: rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
