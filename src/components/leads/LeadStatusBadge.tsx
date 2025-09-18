import { cn } from "@/lib/utils";
import { getStatusColor } from "@/types/lead";

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const statusColor = getStatusColor(status);
  const displayStatus = status.replace('_', ' ');
  
  return (
    <span 
      className={cn(
        "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
        statusColor,
        className
      )}
    >
      {displayStatus}
    </span>
  );
}
