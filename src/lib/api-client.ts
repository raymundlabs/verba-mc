import { supabase } from '@/lib/supabase';

export interface Lead {
  id: string;
  created_at: string;
  confirmation_number: string;
  patient_name: string;
  name: string;
  phone: string;
  email: string | null;
  appointment_date: string;
  appointment_time: string;
  primary_concern: string | null;
  urgency_level: 'emergency' | 'urgent' | 'routine' | null;
  notes: string | null;
  status: string;
  booking_number: string | null;
  metadata: Record<string, any> | null;
}

export const leadsApi = {
  async getAllLeads(): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return data || [];
  },

  async getLeadById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lead:', error);
      return null;
    }

    return data;
  },

  async createLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return data;
  },

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      throw error;
    }

    return data;
  },

  async deleteLead(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  },

  async searchLeads(query: string): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .or(`patient_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching leads:', error);
      return [];
    }

    return data || [];
  }
};
