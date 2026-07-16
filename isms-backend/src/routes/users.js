const router = require("express").Router();
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { authenticate, requireE1 } = require("../middleware/auth");
const { logAudit } = require("../utils/auditLog");

router.get("/", authenticate, requireE1, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, username, full_name, role, is_backup_approver, is_approved, role_reviewed_at, created_at FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/role", authenticate, requireE1, async (req, res) => {
  const { role } = req.body;
  if (!["e1", "e2", "e3"].includes(role)) {
    return res.status(400).json({ error: "Role must be e1, e2, or e3" });
  }

  try {
    if (role === "e1") {
      const e1Check = await pool.query("SELECT id FROM users WHERE role = 'e1' AND id != $1", [req.params.id]);
      if (e1Check.rows.length > 0) {
        return res.status(409).json({ error: "An E1 account already exists. Only one E1 account is permitted." });
      }
    }

    const before = await pool.query("SELECT username, role FROM users WHERE id = $1", [req.params.id]);
    const oldRole = before.rows[0]?.role;

    const { rows } = await pool.query(
      `UPDATE users SET role = $1, role_reviewed_at = NOW() WHERE id = $2
       RETURNING id, username, full_name, role, is_backup_approver, is_approved, role_reviewed_at, created_at`,
      [role, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: "role_changed",
      targetType: "user",
      targetId: rows[0].id,
      details: `Changed ${rows[0].username}'s role from ${oldRole} to ${role}`,
    });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/backup-approver", authenticate, requireE1, async (req, res) => {
  const { is_backup_approver } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE users SET is_backup_approver = $1 WHERE id = $2
       RETURNING id, username, full_name, role, is_backup_approver, is_approved, role_reviewed_at, created_at`,
      [!!is_backup_approver, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: "backup_approver_changed",
      targetType: "user",
      targetId: rows[0].id,
      details: `Set ${rows[0].username}'s backup approver status to ${!!is_backup_approver}`,
    });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/review", authenticate, requireE1, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET role_reviewed_at = NOW() WHERE id = $1
       RETURNING id, username, full_name, role, is_backup_approver, is_approved, role_reviewed_at, created_at`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/approve — approve a pending registration (E1 only)
router.put("/:id/approve-account", authenticate, requireE1, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE users SET is_approved = true WHERE id = $1
       RETURNING id, username, full_name, role, is_backup_approver, is_approved, role_reviewed_at, created_at`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: "account_approved",
      targetType: "user",
      targetId: rows[0].id,
      details: `Approved account for ${rows[0].username}`,
    });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id/reset-password — E1 sets a new password for any user
router.put("/:id/reset-password", authenticate, requireE1, async (req, res) => {
  const { new_password } = req.body;
  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  try {
    const password_hash = await bcrypt.hash(new_password, 10);
    const { rows } = await pool.query(
      `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING username`,
      [password_hash, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "User not found" });

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: "password_reset",
      targetType: "user",
      targetId: req.params.id,
      details: `Reset password for ${rows[0].username}`,
    });

    res.json({ message: `Password reset for ${rows[0].username}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
