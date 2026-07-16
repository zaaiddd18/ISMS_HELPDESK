import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./layout/AppShell";
import Dashboard from "../pages/Dashboard";
import Requests from "../pages/Requests";
import ApprovalDetail from "../pages/ApprovalDetail";
import Assets from "../pages/Assets";
import AuditLogs from "../pages/AuditLogs";
import AdminSettings from "../pages/AdminSettings";
import DataRetention from "../pages/DataRetention";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AccessRequestForm from "../pages/AccessRequestForm";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

function Protected({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <Protected>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/requests" element={<Requests />} />
                  <Route path="/access-request" element={<AccessRequestForm />} />
                  <Route path="/approvals/:id" element={<ApprovalDetail />} />
                  <Route path="/assets" element={<Assets />} />
                  <Route path="/audit" element={<AuditLogs />} />
                  <Route path="/admin" element={<AdminSettings />} />
                  <Route path="/data-retention" element={<DataRetention />} />
                </Routes>
              </AppShell>
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
