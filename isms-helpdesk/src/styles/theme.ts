import { createTheme } from "@mui/material/styles";

// ISMS Helpdesk visual identity — ONGC-inspired maroon and orange,
// IBM Plex for a technical/engineering feel over generic SaaS defaults.

export const colors = {
  maroon: "#5A0E14",
  maroonLight: "#7A1A20",
  paper: "#F7F4EF",
  ink: "#241414",
  orange: "#E06B1F",
  orangeLight: "#F0954F",
  moss: "#2E7D5B",
  brick: "#B33A3A",
  slate: "#7A6866",
};

export const theme = createTheme({
  palette: {
    primary: { main: colors.maroon, light: colors.maroonLight },
    secondary: { main: colors.orange, light: colors.orangeLight },
    success: { main: colors.moss },
    warning: { main: colors.orange },
    error: { main: colors.brick },
    background: { default: colors.paper, paper: "#FFFFFF" },
    text: { primary: colors.ink, secondary: colors.slate },
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 600, letterSpacing: "-0.01em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E8DFD6",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "0.75rem",
        },
      },
    },
  },
});
