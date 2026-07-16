import { useEffect, useState } from "react";
import {
  Card, Typography, Box, TextField, MenuItem, Button, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox, Tabs, Tab,
} from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface EmployeeRow {
  cpf: string;
  name: string;
  designation: string | null;
  financial_year: string;
}

interface RequestRow {
  id: number;
  employee_name: string;
  cpf_no: string;
  status: string;
  request_date: string;
}

export default function DataRetention() {
  const { token, user } = useAuth();
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [tab, setTab] = useState<"employees" | "requests">("employees");

  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [selectedCpfs, setSelectedCpfs] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("/api/employees/years", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setYears(res.data);
        if (res.data.length > 0) setSelectedYear(res.data[0]);
      })
      .catch(() => {});
  }, [token]);

  const loadData = () => {
    if (!selectedYear) return;
    setLoading(true);
    setSelectedCpfs([]);
    setSelectedIds([]);
    const endpoint = tab === "employees" ? "employees" : "requests";
    axios.get(`/api/retention/${endpoint}?year=${encodeURIComponent(selectedYear)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (tab === "employees") setEmployees(res.data);
        else setRequests(res.data);
      })
      .catch(() => setError(`Failed to load ${tab}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [selectedYear, tab, token]);

  const toggleCpf = (cpf: string) => {
    setSelectedCpfs((prev) => prev.includes(cpf) ? prev.filter((c) => c !== cpf) : [...prev, cpf]);
  };

  const toggleId = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage("");
    setError("");
    try {
      if (tab === "employees") {
        const res = await axios.post("/api/retention/employees/delete",
          { cpfs: selectedCpfs, year: selectedYear },
          { headers: { Authorization: `Bearer ${token}` } });
        setMessage(res.data.message);
      } else {
        const res = await axios.post("/api/retention/requests/delete",
          { ids: selectedIds, year: selectedYear },
          { headers: { Authorization: `Bearer ${token}` } });
        setMessage(res.data.message);
      }
      loadData();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Deletion failed");
      else setError("Deletion failed");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (user?.role !== "e1") {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error">Data Retention is only available to E1-level accounts.</Alert>
      </Card>
    );
  }

  const selectedCount = tab === "employees" ? selectedCpfs.length : selectedIds.length;

  return (
    <Card sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
        Data Retention
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Select specific records to permanently delete. This cannot be undone.
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TextField
        select
        label="Financial Year"
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        sx={{ minWidth: 200, mb: 2 }}
      >
        {years.length === 0 && <MenuItem value="">No years available</MenuItem>}
        {years.map((y) => (
          <MenuItem key={y} value={y}>{y}</MenuItem>
        ))}
      </TextField>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Employees" value="employees" />
        <Tab label="Access Requests" value="requests" />
      </Tabs>

      {loading ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>Loading...</Typography>
      ) : tab === "employees" ? (
        employees.length === 0 ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>No employees for this year.</Typography>
        ) : (
          <TableContainer sx={{ mb: 2, maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCpfs.length === employees.length && employees.length > 0}
                      indeterminate={selectedCpfs.length > 0 && selectedCpfs.length < employees.length}
                      onChange={(e) => setSelectedCpfs(e.target.checked ? employees.map((emp) => emp.cpf) : [])}
                    />
                  </TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Designation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.cpf} hover onClick={() => toggleCpf(emp.cpf)} sx={{ cursor: "pointer" }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selectedCpfs.includes(emp.cpf)} onChange={() => toggleCpf(emp.cpf)} />
                    </TableCell>
                    <TableCell>{emp.cpf}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.designation || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : requests.length === 0 ? (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>No requests for this year.</Typography>
      ) : (
        <TableContainer sx={{ mb: 2, maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.length === requests.length && requests.length > 0}
                    indeterminate={selectedIds.length > 0 && selectedIds.length < requests.length}
                    onChange={(e) => setSelectedIds(e.target.checked ? requests.map((r) => r.id) : [])}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id} hover onClick={() => toggleId(r.id)} sx={{ cursor: "pointer" }}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selectedIds.includes(r.id)} onChange={() => toggleId(r.id)} />
                  </TableCell>
                  <TableCell>#{r.id}</TableCell>
                  <TableCell>{r.employee_name}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{new Date(r.request_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button
        variant="contained"
        color="error"
        disabled={selectedCount === 0}
        onClick={() => setConfirmOpen(true)}
      >
        Delete Selected ({selectedCount})
      </Button>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm permanent deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete {selectedCount} selected {tab === "employees" ? "employee record(s)" : "access request(s)"}.
            This action cannot be undone and will be recorded in the audit log.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
