const pool = require("../db");

// Writes a single audit log entry. Never throws — logging failures should not break the request.
async function logAudit({ actorId, actorUsername, action, targetType, targetId, details }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (actor_id, actor_username, action, target_type, target_id, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [actorId || null, actorUsername || null, action, targetType || null, targetId || null, details || null]
    );
  } catch (err) {
    console.error("Failed to write audit log:", err.message);
  }
}

module.exports = { logAudit };
