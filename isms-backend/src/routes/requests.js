const router = require("express").Router();
const pool = require("../db");
const { authenticate, requireE1 } = require("../middleware/auth");
const { logAudit } = require("../utils/auditLog");

router.post("/", authenticate, async (req, res) => {
  const {
    employee_name, cpf_no, username, user_type, machine_list, remark,
    request_date, request_type, financial_year,
  } = req.body;

  if (!employee_name)
    return res.status(400).json({ error: "Employee name is required" });

  const finalType = request_type === "delete" ? "delete" : "create";

  try {
    const { rows } = await pool.query(
      `INSERT INTO access_requests
        (employee_name, cpf_no, username, user_type, machine_list, remark, request_date, created_by, request_type, financial_year)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), $8, $9, $10) RETURNING *`,
      [employee_name, cpf_no, username, user_type, machine_list, remark, request_date || null, req.user.id, finalType, financial_year || null]
    );

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: finalType === "delete" ? "deletion_request_submitted" : "request_submitted",
      targetType: "access_request",
      targetId: rows[0].id,
      details: `${finalType === "delete" ? "Requested deletion for" : "Submitted access request for"} ${employee_name}`,
    });

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === "e1") {
      query = `SELECT r.*, u.username AS requester FROM access_requests r LEFT JOIN users u ON r.created_by = u.id ORDER BY r.created_at DESC`;
      params = [];
    } else {
      query = `SELECT r.*, u.username AS requester FROM access_requests r LEFT JOIN users u ON r.created_by = u.id WHERE r.created_by = $1 ORDER BY r.created_at DESC`;
      params = [req.user.id];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*, u.username AS requester FROM access_requests r LEFT JOIN users u ON r.created_by = u.id WHERE r.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    if (req.user.role !== "e1" && rows[0].created_by !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/approve", authenticate, requireE1, async (req, res) => {
  const { hod_remark } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE access_requests SET status = 'approved', hod_remark = $1, approved_by = $2, approved_at = NOW() WHERE id = $3 RETURNING *`,
      [hod_remark || null, req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });

    const reqData = rows[0];

    if (reqData.request_type === "delete" && reqData.cpf_no) {
      if (reqData.financial_year) {
        await pool.query(
          "UPDATE employees SET is_active = false WHERE cpf = $1 AND financial_year = $2",
          [reqData.cpf_no, reqData.financial_year]
        );
      } else {
        await pool.query("UPDATE employees SET is_active = false WHERE cpf = $1", [reqData.cpf_no]);
      }
    }

    if (reqData.request_type === "create" && reqData.cpf_no && reqData.financial_year) {
      await pool.query(
        `INSERT INTO employees (cpf, name, is_active, financial_year)
         VALUES ($1, $2, true, $3)
         ON CONFLICT (cpf, financial_year) DO UPDATE SET is_active = true`,
        [reqData.cpf_no, reqData.employee_name, reqData.financial_year]
      );
    }

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: reqData.request_type === "delete" ? "deletion_approved" : "request_approved",
      targetType: "access_request",
      targetId: reqData.id,
      details: `Approved ${reqData.request_type === "delete" ? "deletion" : "access"} request for ${reqData.employee_name}${hod_remark ? ` — remark: ${hod_remark}` : ""}`,
    });

    res.json(reqData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id/reject", authenticate, requireE1, async (req, res) => {
  const { hod_remark } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE access_requests SET status = 'rejected', hod_remark = $1, approved_by = $2, approved_at = NOW() WHERE id = $3 RETURNING *`,
      [hod_remark || null, req.user.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });

    await logAudit({
      actorId: req.user.id,
      actorUsername: req.user.username,
      action: rows[0].request_type === "delete" ? "deletion_rejected" : "request_rejected",
      targetType: "access_request",
      targetId: rows[0].id,
      details: `Rejected ${rows[0].request_type === "delete" ? "deletion" : "access"} request for ${rows[0].employee_name}${hod_remark ? ` — remark: ${hod_remark}` : ""}`,
    });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
