import React from "react";
import { Badge } from "@shopify/polaris";

// Status to badge mapping with the four valid statuses
const STATUS_CONFIG: Record<string, {
  tone: "info" | "success" | "attention" | "warning" | "critical" | "new";
  children: string;
}> = {
  submitted: { tone: "success", children: "Submitted" },
  approved: { tone: "warning", children: "Approved" },
  ordered: { tone: "info", children: "Ordered" },
  cancelled: { tone: "critical", children: "Cancelled" },
  declined: { tone: "attention", children: "Declined" },
  expired: { tone: "new", children: "Expired" },
};

// Make the status optional or add fallback
type StatusTagProps = {
  status?: string;
};

export const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  if (!status) return <Badge tone="info">Unknown</Badge>;
  
  const config = STATUS_CONFIG[status.toLowerCase()] || { 
    tone: "info", 
    children: status 
  };

  return <Badge {...config} />;
}; 