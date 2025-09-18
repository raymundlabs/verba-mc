// Import required modules
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400',  // 24 hours
};

// Helper to create CORS response
const corsResponse = (status = 200, body?: any) => {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
};

// Helper function to create responses
const jsonResponse = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
};

serve(async (req) => {
  const requestId = crypto.randomUUID();
  
  const log = (message: string, data?: any) => {
    console.log(`[${requestId}] ${message}`, data || '');
  };

  log('Request received:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, {
      status: 204, // No content
      headers: corsHeaders
    });
  }

  // Set CORS headers for all responses
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...corsHeaders
  });

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
        }
      }
    );

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse(401, { error: 'No authorization token' });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (userError || !user) {
      return corsResponse(401, { error: 'Unauthorized' });
    }

    // Parse request body
    let email, role;
    try {
      const body = await req.json();
      email = body.email;
      role = body.role;
      console.log('Parsed request body:', { email, role });
    } catch (error) {
      console.error('Error parsing request body:', error);
      return jsonResponse(
        { error: 'Invalid request body' },
        400
      );
    }
    
    if (!email || !role) {
      return jsonResponse(
        { error: 'Email and role are required' },
        400
      );
    }

    // Check if user has admin/manager role
    const { data: currentUser, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['admin', 'manager'].includes(currentUser?.role)) {
      return jsonResponse(
        { error: 'Insufficient permissions' },
        403
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser) {
      return jsonResponse(
        { error: 'User with this email already exists' },
        400
      );
    }

    // Generate a random password (will be reset on first login)
    const password = crypto.randomUUID();
    
    // Create the user
    log('Creating user with email:', email);
    const { data: newUser, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
      user_metadata: { invited_by: user.id }
    });

    if (signUpError) {
      log('Error creating user:', signUpError);
      throw new Error(`Failed to create user: ${signUpError.message}`);
    }
    
    log('User created successfully:', newUser.user.id);

    // Create profile with role
    const { error: createProfileError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (createProfileError) throw createProfileError;

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
    log('Error in invite-user function:', error);
    
    // Log the full error stack for debugging
    if (error instanceof Error) {
      log('Error stack:', error.stack);
    }
    
    return corsResponse(500, { 
      error: error.message || 'Failed to process invitation',
      details: error.details || null,
      requestId: requestId // Include request ID for tracking
    });
  }
});
