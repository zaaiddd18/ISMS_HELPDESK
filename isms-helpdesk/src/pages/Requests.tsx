import { useEffect, useState } from "react";
import { Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, CircularProgress, Box } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface AccessRequest {
  id: number; employee_name: string; cpf_no: string;
  status: "pending" | "approved" | "rejected"; requester: string; created_at: string;
}

const statusColor = (status: string) =>
  status === "approved" ? "success" : status === "rejected" ? "error" : "warning";

export default function Requests() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("/api/requests", { headers: { Authorization: `Bearer ${token}` } });
        setRequests(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Failed to load requests");
        else setError("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  const isE1 = user?.role === "e1";

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>All Requests</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : requests.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>No requests found.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>CPF No</TableCell>
                {isE1 && <TableCell>Submitted By</TableCell>}
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id} hover sx={{ cursor: "pointer" }} onClick={() => navigate(`/approvals/${r.id}`)}>
                  <TableCell>#{r.id}</TableCell>
                  <TableCell>{r.employee_name}</TableCell>
                  <TableCell>{r.cpf_no || "-"}</TableCell>
                  {isE1 && <TableCell>{r.requester}</TableCell>}
                  <TableCell><Chip label={r.status} color={statusColor(r.status)} size="small" sx={{ textTransform: "capitalize" }} /></TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
