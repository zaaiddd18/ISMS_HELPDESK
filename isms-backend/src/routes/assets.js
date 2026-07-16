const router = require("express").Router();
const pool = require("../db");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM assets ORDER BY id`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", authenticate, async (req, res) => {
  const { rows: incoming } = req.body;
  if (!Array.isArray(incoming)) return res.status(400).json({ error: "rows must be an array" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM assets");
    for (const row of incoming) {
      const [asset_id, asset_name, asset_type, owner, custodian, classification, criticality, location, status] = row;
      const isEmpty = [asset_id, asset_name, asset_type, owner, custodian, classification, criticality, location, status]
        .every((v) => !v);
      if (isEmpty) continue;
      await client.query(
        `INSERT INTO assets (asset_id, asset_name, asset_type, owner, custodian, classification, criticality, location, status, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [asset_id || null, asset_name || null, asset_type || null, owner || null, custodian || null,
         classification || null, criticality || null, location || null, status || null, req.user.username]
      );
    }
    await client.query("COMMIT");
    res.json({ message: "Saved", updated_by: req.user.username, updated_at: new Date().toISOString() });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
