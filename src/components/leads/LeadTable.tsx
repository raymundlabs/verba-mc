import { Lead } from "@/types/lead";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { UrgencyBadge } from "./UrgencyBadge";
import { Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadTableProps {
  leads: Lead[];
  selectedLeadId?: string;
  onSelectLead: (lead: Lead) => void;
  className?: string;
}

export function LeadTable({ leads, selectedLeadId, onSelectLead, className }: LeadTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Urgency</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Appointment</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Primary Concern</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr 
              key={lead.id} 
              className={cn(
                "cursor-pointer hover:bg-gray-50",
                selectedLeadId === lead.id && "bg-gray-100"
              )}
              onClick={() => onSelectLead(lead)}
            >
              <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-800">
                {lead.name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <LeadStatusBadge status={lead.status} />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <UrgencyBadge urgency={lead.urgency} />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <a 
                  href={`tel:${lead.phone}`} 
                  className="flex items-center hover:underline hover:text-blue-600 text-sm"
                  onClick={e => e.stopPropagation()}
                >
                  <Phone className="h-3 w-3 mr-1" />
                  {lead.phone}
                </a>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-xs">
                {lead.appointment_date && lead.appointment_time ? (
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    {new Date(`${lead.appointment_date}T${lead.appointment_time}`).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                {lead.primaryConcern}
              </td>
            </tr>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                No leads found. Try adjusting your search or filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
