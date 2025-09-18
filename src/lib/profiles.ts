import { supabase } from '@/lib/supabase';

export type AppRole = 'staff' | 'manager';

export interface ProfileRow {
  id: string; // auth.users.id
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export async function getMyProfile(): Promise<ProfileRow | null> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data as ProfileRow | null;
}

export async function upsertMyProfile(role: AppRole): Promise<ProfileRow> {
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) throw userErr || new Error('Not authenticated');
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, role })
    .select('*')
    .single();
  if (error) throw error;
  return data as ProfileRow;
}

export async function listProfiles(): Promise<ProfileRow[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, created_at, updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ProfileRow[]) || [];
}

export async function updateUserRole(userId: string, role: AppRole): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data as ProfileRow;
}


