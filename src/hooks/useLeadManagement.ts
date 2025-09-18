import { useState, useCallback } from 'react';
import { Lead, LeadStatus, getStatusColor } from '@/types/lead';
import { useLeads as useLeadsApi } from '@/hooks/useLeads';
import { formatDistanceToNow } from 'date-fns';

export function useLeadManagement() {
  const { leads: apiLeads, loading, error, searchLeads } = useLeadsApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  // Map API leads to component leads format
  const mapApiLeadToComponentLead = useCallback((apiLead: any): Lead => {
    const status = (apiLead.status || 'new') as LeadStatus;
    const statusColor = getStatusColor(status);
    
    return {
      id: apiLead.id,
      name: apiLead.patient_name || apiLead.name || 'Unknown',
      phone: apiLead.phone,
      primaryConcern: apiLead.primary_concern || 'No concern specified',
      urgency: (apiLead.urgency_level as any) || null,
      status,
      statusColor,
      agent: 'System',
      createdAt: formatDistanceToNow(new Date(apiLead.created_at), { addSuffix: true }),
      bookingNumber: apiLead.booking_number,
      appointment_date: apiLead.appointment_date,
      appointment_time: apiLead.appointment_time,
      notes: apiLead.notes,
      preferredTime: apiLead.appointment_date && apiLead.appointment_time 
        ? new Date(`${apiLead.appointment_date}T${apiLead.appointment_time}`).toLocaleString() 
        : 'No appointment set'
    };
  }, []);

  // Map all API leads to component leads format
  const leads = apiLeads ? apiLeads.map(mapApiLeadToComponentLead) : [];

  // Handle search
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSearching) return;
    
    setIsSearching(true);
    try {
      await searchLeads(searchQuery);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, isSearching, searchLeads]);

  // Handle lead selection
  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setShowDialog(true);
  }, []);

  // Handle dialog close
  const handleDialogClose = useCallback(() => {
    setShowDialog(false);
  }, []);

  return {
    // State
    leads,
    loading,
    error,
    searchQuery,
    isSearching,
    viewMode,
    selectedLead,
    showDialog,
    
    // Actions
    setSearchQuery,
    setViewMode,
    handleSearch,
    handleSelectLead,
    handleDialogClose,
  };
}
