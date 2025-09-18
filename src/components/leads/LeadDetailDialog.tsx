import { Dialog } from "@/components/ui/dialog";
import { Calendar, Clock, User, X } from "lucide-react";
import { Lead } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { UrgencyBadge } from "./UrgencyBadge";

interface LeadDetailDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailDialog({ lead, open, onOpenChange }: LeadDetailDialogProps) {
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg w-full">
        <Dialog.Header>
          <div className="flex justify-between items-start">
            <div>
              <Dialog.Title className="text-xl font-semibold">{lead.name}</Dialog.Title>
              <div className="flex items-center gap-2 mt-1">
                <LeadStatusBadge status={lead.status} />
                <UrgencyBadge urgency={lead.urgency} />
              </div>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Header>
        
        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="h-4 w-4 text-gray-400" />
                <span>{lead.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                <a 
                  href={`tel:${lead.phone}`} 
                  className="flex items-center hover:underline hover:text-blue-600"
                >
                  <Phone className="h-4 w-4 text-gray-400 mr-1" />
                  {lead.phone}
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-2">Added {lead.createdAt}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Appointment</h3>
              {lead.appointment_date && lead.appointment_time ? (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {new Date(`${lead.appointment_date}T${lead.appointment_time}`).toLocaleString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No appointment scheduled</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Primary Concern</h3>
              <p className="text-sm text-gray-700">{lead.primaryConcern}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              {lead.notes ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="whitespace-pre-wrap text-sm text-gray-700">{lead.notes}</p>
                </div>
              ) : (
                <div className="p-6 text-center border-2 border-dashed rounded-md border-gray-200">
                  <p className="text-sm text-gray-500">No notes available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>Edit Lead</Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
