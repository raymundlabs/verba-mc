import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

export const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

app.post('/api/invite-user', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Get the current user from the auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user has permission
    const { data: currentUserData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !['admin', 'manager'].includes(currentUserData?.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserById(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create the user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
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
    const { error: profileUpsertError } = await supabase
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileUpsertError) throw profileUpsertError;

    // Send invite email
    const { error: inviteError } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password: crypto.randomUUID(),
      options: {
        redirectTo: `${process.env.VITE_SITE_URL}/auth/callback`
      }
    });

    if (inviteError) throw inviteError;

    return res.json({ success: true, userId: newUser.user.id });

  } catch (error) {
    console.error('Error in invite-user endpoint:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.details || null
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
