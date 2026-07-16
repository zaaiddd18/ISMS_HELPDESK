import { Box, Typography } from "@mui/material";

export interface AuditEvent {
  label: string;
  timestamp: string;
}

export default function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return (
    <Box>
      {events.map((event, idx) => (
        <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: "primary.main",
              mt: 0.6,
              mr: 2,
              flexShrink: 0,
            }}
          />
          <Box>
            <Typography variant="body2">{event.label}</Typography>
            <Typography variant="caption" color="text.secondary">
              {event.timestamp}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
