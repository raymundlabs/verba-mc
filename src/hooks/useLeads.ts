import { useState, useEffect, useCallback, useRef } from 'react';
import { leadsApi, Lead, supabase } from '@/lib/api-client';

export interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: Error | null;
  refreshLeads: () => Promise<void>;
  searchLeads: (query: string) => Promise<void>;
  createLead: (lead: Omit<Lead, 'id' | 'created_at'>) => Promise<Lead | null>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<Lead | null>;
  deleteLead: (id: string) => Promise<void>;
}

export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Store the current subscription to clean up later
  const subscriptionRef = useRef<any>(null);

  const fetchLeads = useCallback(async () => {
    console.log('fetchLeads called');
    try {
      setLoading(true);
      console.log('Fetching leads from API...');
      const data = await leadsApi.getAllLeads();
      console.log('Leads fetched:', data.length, 'items');
      setLeads(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch leads'));
    } finally {
      setLoading(false);
      console.log('fetchLeads completed');
    }
  }, []);

  // Set up real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    console.log('Setting up real-time subscription...');
    
    // Initial fetch
    fetchLeads();
    
    // Subscribe to changes in the leads table
    const subscription = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          console.log('Change received:', payload);
          // Refresh leads when changes occur
          fetchLeads();
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('Realtime subscription error:', err);
        } else {
          console.log('Realtime subscription status:', status);
        }
      });

    // Store the subscription reference
    subscriptionRef.current = subscription;

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscription...');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [fetchLeads]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    
    // Cleanup on unmount
    return () => {
      cleanup?.();
    };
  }, [setupRealtimeSubscription]);

  const searchLeads = async (query: string) => {
    if (!query.trim()) {
      await fetchLeads();
      return;
    }

    try {
      setLoading(true);
      const results = await leadsApi.searchLeads(query);
      setLeads(results);
      setError(null);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setLoading(false);
    }
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>) => {
    try {
      const newLead = await leadsApi.createLead(lead);
      if (newLead) {
        setLeads(prev => [newLead, ...prev]);
      }
      return newLead;
    } catch (err) {
      console.error('Error creating lead:', err);
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await leadsApi.updateLead(id, updates);
      if (updatedLead) {
        setLeads(prev => 
          prev.map(lead => lead.id === id ? { ...lead, ...updatedLead } : lead)
        );
      }
      return updatedLead;
    } catch (err) {
      console.error('Error updating lead:', err);
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await leadsApi.deleteLead(id);
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) {
      console.error('Error deleting lead:', err);
      throw err;
    }
  };

  return {
    leads,
    loading,
    error,
    refreshLeads: fetchLeads,
    searchLeads,
    createLead,
    updateLead,
    deleteLead,
  };
}
