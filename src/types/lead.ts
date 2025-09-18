export type LeadStatus = 'new' | 'contacted' | 'scheduled' | 'converted' | 'not_interested';
export type LeadUrgency = 'emergency' | 'urgent' | 'routine' | null;

export interface Lead {
  id: string;
  name: string;
  phone: string;
  primaryConcern: string;
  urgency: LeadUrgency;
  status: LeadStatus;
  statusColor: string;
  agent: string;
  createdAt: string;
  bookingNumber?: string | null;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  preferredTime?: string;
}

export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800';
    case 'contacted':
      return 'bg-purple-100 text-purple-800';
    case 'scheduled':
    case 'converted':
      return 'bg-green-100 text-green-800';
    case 'not_interested':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case "emergency":
      return "bg-destructive text-destructive-foreground";
    case "urgent":
      return "bg-warning text-warning-foreground";
    case "routine":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}
