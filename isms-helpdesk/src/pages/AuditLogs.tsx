import { useEffect, useState } from "react";
import {
  Card, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Alert, CircularProgress, Box,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface AuditLog {
  id: number;
  actor_username: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

const actionColor = (action: string) => {
  if (action.includes("approved")) return "success";
  if (action.includes("rejected")) return "error";
  if (action.includes("role_changed")) return "warning";
  return "default";
};

const actionLabel = (action: string) =>
  action.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

export default function AuditLogs() {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/audit-logs", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setLogs(res.data))
      .catch((err) => {
        if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Failed to load audit logs");
        else setError("Failed to load audit logs");
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (user?.role !== "e1") {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error">Audit Logs is only available to E1-level accounts.</Alert>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Audit Logs
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Record of approvals, rejections, and access-level changes across the system.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : logs.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          No activity recorded yet.
        </Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  <TableCell>{log.actor_username || "—"}</TableCell>
                  <TableCell>
                    <Chip label={actionLabel(log.action)} color={actionColor(log.action)} size="small" />
                  </TableCell>
                  <TableCell>{log.details || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
