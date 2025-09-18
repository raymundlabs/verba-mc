import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalLeads: number;
  leadsToday: number;
  appointmentsToday: number;
  followUpsToday: number;
  conversionRate: number;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch total leads count
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Fetch leads created today
    const { count: leadsToday } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString());

    // Fetch appointments scheduled for today
    const { count: appointmentsToday } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', today.toISOString().split('T')[0])
      .lt('appointment_date', tomorrow.toISOString().split('T')[0])
      .eq('status', 'scheduled');

    // Fetch follow-ups needed today
    const { count: followUpsToday } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .or('status.eq.follow_up,status.eq.pending')
      .lte('updated_at', today.toISOString());

    // Calculate conversion rate (simplified)
    const { count: convertedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'converted');

    const conversionRate = totalLeads ? Math.round((convertedLeads || 0) / totalLeads * 100) : 0;

    return {
      totalLeads: totalLeads || 0,
      leadsToday: leadsToday || 0,
      appointmentsToday: appointmentsToday || 0,
      followUpsToday: followUpsToday || 0,
      conversionRate,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const fetchRecentLeads = async (limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent leads:', error);
    return [];
  }
};
