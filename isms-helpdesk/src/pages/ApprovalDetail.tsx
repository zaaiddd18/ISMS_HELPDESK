import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Card, Button, TextField, Typography, Alert, Chip } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import AuditTimeline from "../components/timeline/AuditTimeline";

interface RequestData {
  id: number; employee_name: string; cpf_no: string; text1: string; text2: string; remark: string;
  status: string; hod_remark: string; requester: string; created_at: string; approved_at: string;
}

const statusColor = (s: string): "warning" | "success" | "error" => {
  if (s === "approved") return "success";
  if (s === "rejected") return "error";
  return "warning";
};

export default function ApprovalDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [data, setData] = useState<RequestData | null>(null);
  const [hodRemark, setHodRemark] = useState("");
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    if (!id || !token) return;
    axios.get(`/api/requests/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setData(r.data))
      .catch(() => setError("Failed to load request"));
  }, [id, token]);

  const act = async (action: "approve" | "reject") => {
    if (!token) return;
    try {
      const res = await axios.put(`/api/requests/${id}/${action}`, { hod_remark: hodRemark }, { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
      setActionMsg(`Request ${action}d successfully.`);
    } catch {
      setError(`Failed to ${action} request`);
    }
  };

  const downloadPDF = () =>
    window.open(`${import.meta.env.VITE_API_URL}/api/requests/${id}/pdf?token=${token}`, "_blank");

  const events = data ? [
    { label: "Request submitted", timestamp: new Date(data.created_at).toLocaleString() },
    ...(data.status !== "pending" ? [{ label: `Request ${data.status}`, timestamp: new Date(data.approved_at).toLocaleString() }] : []),
  ] : [];

  const isE1 = user?.role === "e1";

  return (
    <Grid container spacing={2}>
      <Grid size={8}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {actionMsg && <Alert severity="success" sx={{ mb: 2 }}>{actionMsg}</Alert>}
        <Card sx={{ p: 2 }}>
          {data ? (
            <>
              <Typography variant="h6" gutterBottom>
                Request #{data.id} - {data.employee_name}
                <Chip label={data.status.toUpperCase()} color={statusColor(data.status)} size="small" sx={{ ml: 2 }} />
              </Typography>
              <Typography variant="body2">CPF No: {data.cpf_no || "-"}</Typography>
              <Typography variant="body2">Submitted by: {data.requester}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Text 1: {data.text1 || "-"}</Typography>
              <Typography variant="body2">Text 2: {data.text2 || "-"}</Typography>
              <Typography variant="body2">Remark: {data.remark || "-"}</Typography>
              {data.hod_remark && <Typography variant="body2" sx={{ mt: 1 }}>E1 Remark: {data.hod_remark}</Typography>}
              <Button size="small" variant="outlined" sx={{ mt: 2 }} onClick={downloadPDF}>Download PDF</Button>
            </>
          ) : (
            <Typography>Loading...</Typography>
          )}
        </Card>
        <Card sx={{ p: 2, mt: 2 }}><AuditTimeline events={events} /></Card>
      </Grid>

      {isE1 && data?.status === "pending" && (
        <Grid size={4}>
          <Card sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="success" onClick={() => act("approve")}>Approve</Button>
            <Button fullWidth variant="contained" color="error" sx={{ mt: 2 }} onClick={() => act("reject")}>Reject</Button>
            <TextField fullWidth multiline rows={3} sx={{ mt: 2 }} placeholder="Add remark..." value={hodRemark} onChange={(e) => setHodRemark(e.target.value)} />
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
