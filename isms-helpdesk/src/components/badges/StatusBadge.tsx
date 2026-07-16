import { Chip } from "@mui/material";

export type StatusType = "pending" | "approved" | "rejected" | "overdue" | "active";

const colorMap: Record<StatusType, "warning" | "success" | "error" | "default" | "info"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  overdue: "error",
  active: "info",
};

export default function StatusBadge({ status }: { status: StatusType }) {
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={colorMap[status] ?? "default"}
      size="small"
    />
  );
}
