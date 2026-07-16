import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Topbar() {
  return (
    <AppBar position="static" sx={{ bgcolor: "white", color: "black" }}>
      <Toolbar>
        <Typography>ISMS Helpdesk</Typography>
      </Toolbar>
    </AppBar>
  );
}
