import { Card, Typography } from "@mui/material";

interface KPICardProps {
  title: string;
  value: string | number;
}

export default function KPICard({ title, value }: KPICardProps) {
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="caption">{title}</Typography>
      <Typography variant="h5">{value}</Typography>
    </Card>
  );
}
