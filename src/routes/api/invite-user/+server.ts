import { json } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

// This runs on the server, so it's safe to use the service role key
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, role } = await request.json();

    if (!email || !role) {
      return json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Verify the current user is an admin/manager
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      request.headers.get('Authorization')?.replace('Bearer ', '') || ''
    );

    if (userError || !user) {
      return json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['admin', 'manager'].includes(profile?.role)) {
      return json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email);
    
    if (existingUser) {
      return json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { 
        invited: true,
        invited_by: user.id 
      }
    });

    if (createError) throw createError;
    if (!newUser.user) throw new Error('Failed to create user');

    // Create profile
    const { error: profileUpsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileUpsertError) throw profileUpsertError;

    // Send invite email
    const { error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password: crypto.randomUUID(),
      options: {
        redirectTo: `${import.meta.env.VITE_SITE_URL}/auth/callback`
      }
    });

    if (inviteError) throw inviteError;

    return json({ 
      success: true,
      userId: newUser.user.id 
    });

  } catch (error) {
    console.error('Error in invite-user API:', error);
    return json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
};
