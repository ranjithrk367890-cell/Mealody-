import { Router, Request, Response } from 'express';
import { supabase, memoryStore, MemoryUser } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cryptoNativeUUID } from '../utils/uuid.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mealody_premium_jwt_secret_key_98765';

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Full name is required' });
    return;
  }
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Valid email address is required' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = name.trim();

  try {
    let existingUser: any = null;
    let dbAvailable = true;

    // 1. Check existing user in public users table
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) {
        console.warn('⚠️ Supabase lookup failed during signup, switching to local store:', error.message || error);
        dbAvailable = false;
      } else {
        existingUser = data;
      }
    } catch (dbErr: any) {
      console.warn('⚠️ Supabase connection error during signup:', dbErr.message || dbErr);
      dbAvailable = false;
    }

    // Check memory store if DB check failed or didn't find user
    if (!existingUser && memoryStore.getUserByEmail(cleanEmail)) {
      existingUser = memoryStore.getUserByEmail(cleanEmail);
    }

    if (existingUser) {
      res.status(400).json({ error: 'Email address is already registered. Please login instead.' });
      return;
    }

    // 2. Hash Password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    let newUserId = cryptoNativeUUID();
    const createdAt = new Date().toISOString();

    // 3. Optional: Attempt Supabase Auth SDK Sign Up if available
    if (dbAvailable) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            data: { name: cleanName }
          }
        });

        if (!authError && authData?.user?.id) {
          newUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('⚠️ Supabase Auth API skipped/offline:', authErr);
      }
    }

    let createdUser: { id: string; name: string; email: string } = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail
    };

    // 4. Insert into public users table
    if (dbAvailable) {
      try {
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .upsert([
            {
              id: newUserId,
              name: cleanName,
              email: cleanEmail,
              password_hash: passwordHash,
              language: 'English'
            }
          ], { onConflict: 'email' })
          .select('id, name, email')
          .maybeSingle();

        if (insertError) {
          console.warn('⚠️ Supabase upsert error during signup, keeping local record:', insertError.message || insertError);
        } else if (inserted) {
          createdUser = {
            id: inserted.id,
            name: inserted.name || cleanName,
            email: inserted.email || cleanEmail
          };
        }
      } catch (insertErr: any) {
        console.warn('⚠️ Supabase insert exception during signup:', insertErr.message || insertErr);
      }
    }

    // Always mirror to in-memory store for fallback guarantee
    memoryStore.addUser({
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      password_hash: passwordHash,
      language: 'English',
      created_at: createdAt
    });

    // 5. Issue JWT session token
    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email
      }
    });

  } catch (err: any) {
    console.error('❌ Signup unexpected error:', err);
    res.status(500).json({ error: 'Account creation failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    let user: MemoryUser | null = null;
    let authAuthenticated = false;

    // 1. Try Supabase Auth SDK Sign In if online
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!authError && authData?.user) {
        authAuthenticated = true;
        user = {
          id: authData.user.id,
          name: authData.user.user_metadata?.name || splitEmailName(cleanEmail),
          email: authData.user.email || cleanEmail,
          password_hash: '',
          language: 'English',
          created_at: authData.user.created_at || new Date().toISOString()
        };
      }
    } catch (authErr) {
      console.warn('⚠️ Supabase Auth API offline or skipped:', authErr);
    }

    // 2. Fetch user from public.users table if Supabase Auth wasn't used
    if (!user) {
      try {
        const { data: dbUser, error: fetchError } = await supabase
          .from('users')
          .select('id, name, email, password_hash, language, created_at')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (fetchError) {
          console.warn('⚠️ Supabase query error during login, checking local store:', fetchError.message || fetchError);
        } else if (dbUser) {
          user = {
            id: dbUser.id,
            name: dbUser.name || splitEmailName(cleanEmail),
            email: dbUser.email,
            password_hash: dbUser.password_hash || '',
            language: dbUser.language || 'English',
            created_at: dbUser.created_at || new Date().toISOString()
          };
        }
      } catch (dbErr: any) {
        console.warn('⚠️ Supabase connection failure during login:', dbErr.message || dbErr);
      }
    }

    // 3. Fallback to Memory Store if DB failed or user not found in DB
    if (!user) {
      const memUser = memoryStore.getUserByEmail(cleanEmail);
      if (memUser) {
        user = memUser;
      }
    }

    // 4. If account does NOT exist anywhere -> Return 404 with notFound flag for auto-redirect
    if (!user) {
      res.status(404).json({
        error: 'User account not found. Please check your email or sign up.',
        notFound: true,
        email: cleanEmail
      });
      return;
    }

    // 5. Verify Password hash using bcrypt (if not already authenticated via Supabase Auth)
    if (!authAuthenticated && user.password_hash) {
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password_hash);
      } catch (bcryptErr) {
        console.error('Password comparison error:', bcryptErr);
      }

      if (!isMatch) {
        res.status(401).json({ error: 'Invalid password. Please check your password and try again.' });
        return;
      }
    }

    // 6. Synchronize user record back to public.users if needed
    try {
      supabase.from('users').upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        language: user.language || 'English'
      }, { onConflict: 'email' });
    } catch (syncErr) {
      // Non-blocking
    }

    // 7. Create Session JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err: any) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Login failed due to a server error. Please try again.' });
  }
});

function splitEmailName(email: string): string {
  const parts = email.split('@')[0];
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

export default router;
