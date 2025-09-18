import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getUrgencyColor } from "@/types/lead";

interface UrgencyBadgeProps {
  urgency: string | null | undefined;
  className?: string;
}

export function UrgencyBadge({ urgency, className }: UrgencyBadgeProps) {
  if (!urgency) return null;
  
  const urgencyColor = getUrgencyColor(urgency);
  
  return (
    <Badge 
      variant={urgency === 'emergency' ? 'destructive' : 'outline'}
      className={cn(
        "text-[10px] h-5 px-1.5 py-0",
        urgencyColor,
        className
      )}
    >
      {urgency}
    </Badge>
  );
}
