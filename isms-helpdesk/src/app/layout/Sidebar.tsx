import { Box, List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Chip } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  e1Only?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Requests", path: "/requests", icon: <ListAltOutlinedIcon fontSize="small" /> },
  { label: "Access Request Form", path: "/access-request", icon: <PersonAddAltOutlinedIcon fontSize="small" /> },
  { label: "Assets", path: "/assets", icon: <InventoryOutlinedIcon fontSize="small" /> },
  { label: "Audit Logs", path: "/audit", icon: <FactCheckOutlinedIcon fontSize="small" />, e1Only: true },
  { label: "Admin", path: "/admin", icon: <AdminPanelSettingsOutlinedIcon fontSize="small" />, e1Only: true },
  { label: "Data Retention", path: "/data-retention", icon: <DeleteSweepOutlinedIcon fontSize="small" />, e1Only: true },
];

const roleColor: Record<string, string> = {
  e1: "#E06B1F",
  e2: "#B08C88",
  e3: "#B08C88",
};

export default function Sidebar() {
  const nav = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  const isE1 = user?.role === "e1";
  const visibleItems = navItems.filter((item) => !item.e1Only || isE1);

  return (
    <Box sx={{ width: 264, bgcolor: "#5A0E14", color: "#F7F4EF", minHeight: "100vh", p: 2.5, display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.25, letterSpacing: "0.02em" }}>
        ISMS
      </Typography>
      <Typography variant="caption" sx={{ color: "#D3AFA9", mb: 2, display: "block", fontFamily: '"IBM Plex Mono", monospace' }}>
        Information Security Helpdesk
      </Typography>

      {user && (
        <Box
          sx={{
            border: "1px solid #7A2E2E",
            borderRadius: 1,
            p: 1.25,
            mb: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user.full_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#D3AFA9" }}>
              Clearance level
            </Typography>
          </Box>
          <Chip
            label={user.role.toUpperCase()}
            size="small"
            sx={{
              bgcolor: roleColor[user.role] || "#B08C88",
              color: "#2A0A0A",
              fontWeight: 700,
              fontFamily: '"IBM Plex Mono", monospace',
            }}
          />
        </Box>
      )}

      <List sx={{ flex: 1 }}>
        {visibleItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              onClick={() => nav(item.path)}
              sx={{
                color: active ? "#F7F4EF" : "#DDBFB9",
                bgcolor: active ? "#7A1A20" : "transparent",
                borderRadius: 1,
                mb: 0.25,
                borderLeft: active ? "3px solid #E06B1F" : "3px solid transparent",
                "&:hover": { bgcolor: "#7A1A20" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} primary={item.label} />
            </ListItemButton>
          );
        })}

        {isE1 && (
          <ListItemButton onClick={() => nav("/requests")} sx={{ color: "#DDBFB9", borderRadius: 1, mt: 1 }}>
            <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
              <GavelOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Approvals"
              secondary="Open a request from Requests"
              primaryTypographyProps={{ fontSize: 14 }}
              secondaryTypographyProps={{ fontSize: 11, color: "#B08C88" }}
            />
          </ListItemButton>
        )}
      </List>

      <Divider sx={{ borderColor: "#7A2E2E", mb: 1 }} />
      <ListItemButton onClick={handleLogout} sx={{ color: "#F0B0AC", borderRadius: 1 }}>
        <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>
          <LogoutOutlinedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
      </ListItemButton>
    </Box>
  );
}
