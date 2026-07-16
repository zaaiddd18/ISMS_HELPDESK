import { Box } from "@mui/material";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useIdleLogout } from "../../hooks/useIdleLogout";

export default function AppShell({ children }: { children: ReactNode }) {
  useIdleLogout();

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flex: 1 }}>
        <Topbar />
        <Box sx={{ p: 3, background: "#F5F7FA", minHeight: "100vh" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
