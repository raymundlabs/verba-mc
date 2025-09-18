// Import required modules
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Helper function to create responses
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with the Auth context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: req.headers.get('Authorization') ?? ''
          }
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Parse request body
    const { email, role } = await req.json();
    
    if (!email || !role) {
      return jsonResponse({ error: 'Email and role are required' }, 400);
    }

    // Check if user has admin/manager role
    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['admin', 'manager'].includes(currentUser?.role)) {
      return jsonResponse({ error: 'Insufficient permissions' }, 403);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser) {
      return jsonResponse({ error: 'User with this email already exists' }, 400);
    }

    // Generate a random password (will be reset on first login)
    const password = crypto.randomUUID();
    
    // Create the user
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: { invited_by: user.id }
    });

    if (signUpError) throw signUpError;

    // Create profile with role
    const { error: profileError2 } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError2) throw profileError2;

    // Send invitation email
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get('SITE_URL')}/auth/callback`
    });

    if (inviteError) throw inviteError;

    return jsonResponse({ 
      success: true, 
      message: 'Invitation sent successfully',
      userId: newUser.user.id 
    });

  } catch (error) {
    console.error('Error in invite-user:', error);
    return jsonResponse({
      error: error.message || 'Failed to process invitation',
      details: error.details || null
    }, 500);
  }
});
