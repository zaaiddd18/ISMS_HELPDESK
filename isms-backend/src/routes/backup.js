const router = require("express").Router();
const { spawn } = require("child_process");
const { authenticate, requireE1 } = require("../middleware/auth");
const { logAudit } = require("../utils/auditLog");

// GET /api/backup — E1 only, streams a pg_dump of the entire database
router.get("/", authenticate, requireE1, async (req, res) => {
  const dbName = process.env.DB_NAME;
  const dbHost = process.env.DB_HOST;
  const dbPort = process.env.DB_PORT;
  const dbUser = process.env.DB_USER;

  const filename = `isms_master_backup_${new Date().toISOString().slice(0, 10)}.sql`;
  res.setHeader("Content-Type", "application/sql");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const dump = spawn("pg_dump", [
    "-h", dbHost,
    "-p", dbPort,
    "-U", dbUser,
    "-d", dbName,
    "--no-owner",
    "--no-privileges",
  ], {
    env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD },
  });

  dump.stdout.pipe(res);

  dump.stderr.on("data", (data) => {
    console.error("pg_dump error:", data.toString());
  });

  dump.on("close", async (code) => {
    if (code === 0) {
      await logAudit({
        actorId: req.user.id,
        actorUsername: req.user.username,
        action: "backup_downloaded",
        targetType: "database",
        targetId: dbName,
        details: `Downloaded a full database backup`,
      });
    }
  });

  dump.on("error", (err) => {
    console.error("Failed to start pg_dump:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: "Backup failed — pg_dump not found or not executable" });
    }
  });
});

module.exports = router;
