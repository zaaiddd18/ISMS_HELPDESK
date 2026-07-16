import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Card, TextField, Button, Typography, Alert, MenuItem } from "@mui/material";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ full_name: "", username: "", password: "", confirm: "", role: "e2" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [e1Exists, setE1Exists] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/auth/e1-exists")
      .then((res) => setE1Exists(res.data.exists))
      .catch(() => {});
  }, []);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPendingMessage("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        full_name: form.full_name, username: form.username, password: form.password, role: form.role,
      });

      if (res.data.user.is_approved) {
        navigate("/login", { state: { registered: true } });
      } else {
        setPendingMessage(res.data.message);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Registration failed");
      else setError("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (pendingMessage) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F7FA" }}>
        <Card sx={{ p: 4, width: 380, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>Account Created</Typography>
          <Alert severity="info" sx={{ mb: 2, textAlign: "left" }}>{pendingMessage}</Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link to="/login" style={{ color: "#1E3A8A" }}>Back to sign in</Link>
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F7FA",
      }}
    >
      <Card sx={{ p: 4, width: 380 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>Create Account</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>Register to submit access requests</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField label="Full Name" fullWidth required value={form.full_name} onChange={update("full_name")} sx={{ mb: 2 }} />
          <TextField label="Username" fullWidth required value={form.username} onChange={update("username")} sx={{ mb: 2 }} />
          <TextField select label="Access Level" fullWidth required value={form.role} onChange={update("role")} sx={{ mb: 2 }}
            helperText={e1Exists ? "E1 is already assigned. New accounts join as E2 or E3, pending approval." : "E1 can approve requests. E2 and E3 submit requests."}>
            {!e1Exists && <MenuItem value="e1">E1 - Approver</MenuItem>}
            <MenuItem value="e2">E2 - Employee</MenuItem>
            <MenuItem value="e3">E3 - Employee</MenuItem>
          </TextField>
          <TextField label="Password" type="password" fullWidth required value={form.password} onChange={update("password")}
            helperText="At least 8 characters, one uppercase letter, one number" sx={{ mb: 2 }} />
          <TextField label="Confirm Password" type="password" fullWidth required value={form.confirm} onChange={update("confirm")} sx={{ mb: 3 }} />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>{loading ? "Registering..." : "Register"}</Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Already have an account? <Link to="/login" style={{ color: "#1E3A8A" }}>Sign in</Link>
        </Typography>
      </Card>
    </Box>
  );
}
