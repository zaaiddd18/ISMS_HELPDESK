import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Box, Card, TextField, Button, Typography, Alert } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = (location.state as { registered?: boolean })?.registered;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", { username, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Login failed");
      else setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

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
      <Card sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "primary.main" }}>
          ISMS Helpdesk
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Sign in to continue
        </Typography>
        {justRegistered && <Alert severity="success" sx={{ mb: 2 }}>Account created! Sign in below.</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            fullWidth
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#1E3A8A" }}>Register</Link>
        </Typography>
      </Card>
    </Box>
  );
}
