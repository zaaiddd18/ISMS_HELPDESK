require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const requestRoutes = require("./routes/requests");
const pdfRoutes = require("./routes/pdf");
const userRoutes = require("./routes/users");
const employeeRoutes = require("./routes/employees");
const dashboardRoutes = require("./routes/dashboard");
const assetRoutes = require("./routes/assets");
const auditLogRoutes = require("./routes/auditLogs");
const retentionRoutes = require("./routes/retention");
const backupRoutes = require("./routes/backup");

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/requests", pdfRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/retention", retentionRoutes);
app.use("/api/backup", backupRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ISMS backend running on http://localhost:${PORT}`));
