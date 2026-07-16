import { useEffect, useState } from "react";
import {
  Grid, Card, TextField, MenuItem, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, List, ListItem, ListItemText,
} from "@mui/material";
import axios from "axios";
import KPICard from "../components/cards/KPICard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  employees: number;
}

interface RequestRow {
  id: number;
  employee_name: string;
  status: "pending" | "approved" | "rejected";
  requester: string;
  created_at: string;
  approved_at: string | null;
}

const statusColor = (status: string) =>
  status === "approved" ? "success" : status === "rejected" ? "error" : "warning";

export default function Dashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [financialYears, setFinancialYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, employees: 0 });
  const [requests, setRequests] = useState<RequestRow[]>([]);

  useEffect(() => {
    axios.get("/api/employees/years", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setFinancialYears(res.data);
        if (res.data.length > 0) setSelectedYear(res.data[0]);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const yearParam = selectedYear ? `?year=${encodeURIComponent(selectedYear)}` : "";
    axios.get(`/api/dashboard/stats${yearParam}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, [token, selectedYear]);

  useEffect(() => {
    axios.get("/api/requests", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setRequests(res.data))
      .catch(() => {});
  }, [token]);

  const recentRequests = requests.slice(0, 5);

  const activityEvents = requests
    .flatMap((r) => {
      const events = [{ label: `${r.employee_name} — request submitted`, timestamp: r.created_at, id: `${r.id}-submit` }];
      if (r.status !== "pending" && r.approved_at) {
        events.push({
          label: `${r.employee_name} — request ${r.status}`,
          timestamp: r.approved_at,
          id: `${r.id}-${r.status}`,
        });
      }
      return events;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 8);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          select
          label="Financial Year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          sx={{ minWidth: 200, mb: 1 }}
        >
          {financialYears.length === 0 && <MenuItem value="">No years available</MenuItem>}
          {financialYears.map((y) => (
            <MenuItem key={y} value={y}>{y}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={3}>
        <KPICard title="Pending" value={String(stats.pending)} />
      </Grid>
      <Grid size={3}>
        <KPICard title="Approved" value={String(stats.approved)} />
      </Grid>
      <Grid size={3}>
        <KPICard title="Rejected" value={String(stats.rejected)} />
      </Grid>
      <Grid size={3}>
        <KPICard title="Employees" value={String(stats.employees)} />
      </Grid>

      <Grid size={8}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Recent Requests
          </Typography>
          {recentRequests.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No requests yet.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Submitted</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentRequests.map((r) => (
                    <TableRow
                      key={r.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/approvals/${r.id}`)}
                    >
                      <TableCell>#{r.id}</TableCell>
                      <TableCell>{r.employee_name}</TableCell>
                      <TableCell>
                        <Chip label={r.status} color={statusColor(r.status)} size="small" sx={{ textTransform: "capitalize" }} />
                      </TableCell>
                      <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Grid>

      <Grid size={4}>
        <Card sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Activity Feed
          </Typography>
          {activityEvents.length === 0 ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No recent activity.
            </Typography>
          ) : (
            <List dense>
              {activityEvents.map((e) => (
                <ListItem key={e.id} divider>
                  <ListItemText
                    primary={e.label}
                    secondary={new Date(e.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}
