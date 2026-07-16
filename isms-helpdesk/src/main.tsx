import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import App from "./App";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./styles/theme";
import { AuthProvider } from "./context/AuthContext";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

// Global interceptor: any 401 response (expired/invalid token) forces logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth:logout"));
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
