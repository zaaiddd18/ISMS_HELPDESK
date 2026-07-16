import { useEffect, useState } from "react";
import {
  Card, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, Alert, CircularProgress, Box, Chip, Switch, Button, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface AppUser {
  id: number;
  username: string;
  full_name: string;
  role: "e1" | "e2" | "e3";
  is_backup_approver: boolean;
  is_approved: boolean;
  role_reviewed_at: string;
  created_at: string;
}

const REVIEW_OVERDUE_DAYS = 90;

const isReviewOverdue = (reviewedAt: string) => {
  const days = (Date.now() - new Date(reviewedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days > REVIEW_OVERDUE_DAYS;
};

export default function AdminSettings() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [resetTarget, setResetTarget] = useState<AppUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  const [backupLoading, setBackupLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/users", { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Failed to load users");
      else setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleRoleChange = async (id: number, e: SelectChangeEvent) => {
    const newRole = e.target.value;
    setUpdatingId(id);
    setError("");
    try {
      await axios.put(`/api/users/${id}/role`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchUsers();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Failed to update role");
      else setError("Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBackupToggle = async (id: number, checked: boolean) => {
    setUpdatingId(id);
    setError("");
    try {
      await axios.put(`/api/users/${id}/backup-approver`, { is_backup_approver: checked }, { headers: { Authorization: `Bearer ${token}` } });
      await fetchUsers();
    } catch {
      setError("Failed to update backup approver status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkReviewed = async (id: number) => {
    setUpdatingId(id);
    try {
      await axios.put(`/api/users/${id}/review`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchUsers();
    } catch {
      setError("Failed to mark as reviewed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApproveAccount = async (id: number) => {
    setUpdatingId(id);
    setError("");
    setMessage("");
    try {
      await axios.put(`/api/users/${id}/approve-account`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMessage("Account approved.");
      await fetchUsers();
    } catch {
      setError("Failed to approve account");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      return;
    }
    setResetting(true);
    setError("");
    try {
      await axios.put(`/api/users/${resetTarget.id}/reset-password`,
        { new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } });
      setMessage(`Password reset for ${resetTarget.username}.`);
      setResetTarget(null);
      setNewPassword("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Failed to reset password");
      else setError("Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/backup", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `isms_master_backup_${new Date().toISOString().slice(0, 10)}.sql`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage("Backup downloaded.");
    } catch {
      setError("Failed to download backup");
    } finally {
      setBackupLoading(false);
    }
  };

  if (user?.role !== "e1") {
    return (
      <Card sx={{ p: 3 }}>
        <Alert severity="error">Admin Settings is only available to E1-level accounts.</Alert>
      </Card>
    );
  }

  const overdueCount = users.filter((u) => isReviewOverdue(u.role_reviewed_at)).length;
  const pendingUsers = users.filter((u) => !u.is_approved);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Card sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Database Backup</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Download a full backup of the database. Store it somewhere safe, outside this machine.
            </Typography>
          </Box>
          <Button variant="contained" onClick={handleDownloadBackup} disabled={backupLoading}>
            {backupLoading ? "Preparing..." : "Download Backup"}
          </Button>
        </Box>
      </Card>

      {pendingUsers.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Pending Account Approvals ({pendingUsers.length})
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Requested Role</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingUsers.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>{u.full_name}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell><Chip label={u.role.toUpperCase()} size="small" /></TableCell>
                    <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button size="small" variant="contained" onClick={() => handleApproveAccount(u.id)} disabled={updatingId === u.id}>
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
          Admin Settings — User Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Manage access levels, backup approval rights, and password resets. Only one E1 account is permitted.
        </Typography>

        {overdueCount > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {overdueCount} account{overdueCount > 1 ? "s" : ""} {overdueCount > 1 ? "have" : "has"} not had an access review in over {REVIEW_OVERDUE_DAYS} days.
          </Alert>
        )}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Access Level</TableCell>
                  <TableCell>Backup Approver</TableCell>
                  <TableCell>Last Reviewed</TableCell>
                  <TableCell>Password</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => {
                  const overdue = isReviewOverdue(u.role_reviewed_at);
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>#{u.id}</TableCell>
                      <TableCell>{u.full_name}</TableCell>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e)}
                          disabled={updatingId === u.id}
                          sx={{ minWidth: 100 }}
                        >
                          <MenuItem value="e1"><Chip label="E1" size="small" /></MenuItem>
                          <MenuItem value="e2"><Chip label="E2" size="small" /></MenuItem>
                          <MenuItem value="e3"><Chip label="E3" size="small" /></MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={u.role === "e1" ? "E1 already has full approval rights" : "Allow this user to approve requests if E1 is unavailable"}>
                          <span>
                            <Switch
                              checked={u.is_backup_approver}
                              disabled={u.role === "e1" || updatingId === u.id}
                              onChange={(e) => handleBackupToggle(u.id, e.target.checked)}
                            />
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="body2" sx={{ color: overdue ? "error.main" : "text.secondary" }}>
                            {new Date(u.role_reviewed_at).toLocaleDateString()}
                            {overdue && " (overdue)"}
                          </Typography>
                          <Button size="small" onClick={() => handleMarkReviewed(u.id)} disabled={updatingId === u.id}>
                            Mark reviewed
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => setResetTarget(u)}>Reset</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={!!resetTarget} onClose={() => setResetTarget(null)}>
        <DialogTitle>Reset password for {resetTarget?.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="New Password"
            helperText="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetTarget(null)} disabled={resetting}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained" disabled={resetting}>
            {resetting ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
