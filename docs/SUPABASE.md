# SLMGEN Supabase Integration Guide

Comprehensive documentation for integrating Supabase with SLMGEN for authentication, database, and storage.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Database Schema](#database-schema)
3. [Row Level Security](#row-level-security)
4. [Storage Configuration](#storage-configuration)
5. [Authentication Flow](#authentication-flow)
6. [Backend Integration](#backend-integration)
7. [Frontend Integration](#frontend-integration)
8. [Environment Variables](#environment-variables)

---

## Project Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project credentials:
   - **Project URL**: `https://<project-id>.supabase.co`
   - **Anon Key**: Public key for client-side
   - **Service Role Key**: Server-side only (keep secret)

### 2. Install Dependencies

**Backend (Python)**:
```bash
pip install supabase python-jose[cryptography]
```

**Frontend (Next.js)**:
```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

---

## Database Schema

### Tables

#### `profiles` - User profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

#### `jobs` - Fine-tuning jobs
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT UNIQUE NOT NULL,
  
  -- Dataset info
  dataset_filename TEXT NOT NULL,
  dataset_path TEXT NOT NULL,
  total_examples INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  quality_score FLOAT NOT NULL,
  
  -- Configuration
  task_type TEXT NOT NULL,
  deployment_target TEXT NOT NULL,
  
  -- Model selection
  selected_model_id TEXT NOT NULL,
  selected_model_name TEXT NOT NULL,
  model_score FLOAT NOT NULL,
  
  -- Training config
  training_config JSONB DEFAULT '{}',
  
  -- Notebook
  notebook_filename TEXT,
  notebook_path TEXT,
  colab_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'created',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_session_id ON jobs(session_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
```

#### `datasets` - Dataset metadata
```sql
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  
  -- Stats
  total_examples INTEGER,
  total_tokens INTEGER,
  avg_tokens_per_example INTEGER,
  quality_score FLOAT,
  single_turn_pct FLOAT,
  multi_turn_pct FLOAT,
  has_system_prompts BOOLEAN DEFAULT FALSE,
  quality_issues JSONB DEFAULT '[]',
  
  -- Characteristics
  is_multilingual BOOLEAN DEFAULT FALSE,
  looks_like_json BOOLEAN DEFAULT FALSE,
  is_multi_turn BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_datasets_user_id ON datasets(user_id);
```

#### `training_configs` - Saved training presets
```sql
CREATE TABLE training_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,  -- For built-in presets
  
  -- LoRA parameters
  lora_rank INTEGER DEFAULT 16,
  lora_alpha INTEGER DEFAULT 32,
  lora_dropout FLOAT DEFAULT 0.05,
  
  -- Training parameters
  learning_rate FLOAT DEFAULT 2e-4,
  num_epochs INTEGER DEFAULT 3,
  batch_size INTEGER DEFAULT 4,
  gradient_accumulation_steps INTEGER DEFAULT 4,
  warmup_ratio FLOAT DEFAULT 0.03,
  max_seq_length INTEGER DEFAULT 2048,
  
  -- Optimizer
  optimizer TEXT DEFAULT 'adamw_8bit',
  scheduler TEXT DEFAULT 'linear',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert system presets
INSERT INTO training_configs (name, is_system, lora_rank, learning_rate, num_epochs) VALUES
  ('Fast', TRUE, 8, 5e-4, 1),
  ('Balanced', TRUE, 16, 2e-4, 3),
  ('Quality', TRUE, 32, 1e-4, 5);
```

#### `model_catalog` - Available models
```sql
CREATE TABLE model_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  context_window INTEGER NOT NULL,
  is_gated BOOLEAN DEFAULT FALSE,
  
  strengths TEXT[] DEFAULT '{}',
  good_for_tasks TEXT[] DEFAULT '{}',
  good_for_deploy TEXT[] DEFAULT '{}',
  min_examples INTEGER DEFAULT 100,
  
  -- Resource requirements
  vram_required_gb FLOAT,
  training_time_per_1k_examples_min INTEGER,
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security

Enable RLS on all tables:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_configs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Jobs: Users can only access their own jobs
CREATE POLICY "Users can view own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- Datasets: Same as jobs
CREATE POLICY "Users can view own datasets"
  ON datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own datasets"
  ON datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets"
  ON datasets FOR DELETE
  USING (auth.uid() = user_id);

-- Training configs: Users see own + system presets
CREATE POLICY "Users can view own and system configs"
  ON training_configs FOR SELECT
  USING (auth.uid() = user_id OR is_system = TRUE);

CREATE POLICY "Users can insert own configs"
  ON training_configs FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update own configs"
  ON training_configs FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete own configs"
  ON training_configs FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- Model catalog: Public read
CREATE POLICY "Anyone can view models"
  ON model_catalog FOR SELECT
  USING (is_active = TRUE);
```

---

## Storage Configuration

### Create Storage Buckets

```sql
-- Datasets bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('datasets', 'datasets', FALSE);

-- Notebooks bucket (private with signed URLs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notebooks', 'notebooks', FALSE);

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', TRUE);
```

### Storage Policies

```sql
-- Datasets: Users can upload/download their own
CREATE POLICY "Users can upload datasets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own datasets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own datasets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'datasets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Notebooks: Same pattern
CREATE POLICY "Users can upload notebooks"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'notebooks' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own notebooks"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'notebooks' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatars: Public read, authenticated upload
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );
```

### Storage Path Convention

```
datasets/{user_id}/{job_id}/{filename}.jsonl
notebooks/{user_id}/{job_id}/{filename}.ipynb
avatars/{user_id}/avatar.{ext}
```

---

## Authentication Flow

### Supported Auth Methods

1. **Email/Password** - Traditional signup
2. **Magic Link** - Passwordless email
3. **OAuth** - GitHub, Google

### Auth Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/signup` | POST | Create account |
| `/auth/login` | POST | Email/password login |
| `/auth/logout` | POST | Sign out |
| `/auth/magic-link` | POST | Send magic link |
| `/auth/callback` | GET | OAuth callback |
| `/auth/reset-password` | POST | Request password reset |
| `/auth/update-password` | POST | Set new password |

### JWT Validation (Backend)

```python
from jose import jwt, JWTError
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_ANON_KEY"]
JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

async def verify_token(token: str) -> dict:
    """Verify Supabase JWT token."""
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## Backend Integration

### Supabase Client Setup

```python
# libslmgen/app/supabase.py
import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """Get Supabase client with service role key."""
    return create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SERVICE_KEY"]
    )

def get_supabase_user_client(access_token: str) -> Client:
    """Get Supabase client with user's access token."""
    client = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_ANON_KEY"]
    )
    client.auth.set_session(access_token, "")
    return client
```

### Auth Middleware

```python
# libslmgen/app/middleware/auth.py
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Extract and verify user from JWT."""
    token = credentials.credentials
    payload = await verify_token(token)
    return {
        "id": payload["sub"],
        "email": payload.get("email"),
        "role": payload.get("role", "authenticated")
    }
```

### Example Protected Route

```python
@router.post("/upload")
async def upload_dataset(
    file: UploadFile,
    user: dict = Depends(get_current_user)
):
    user_id = user["id"]
    # ... handle upload with user context
```

---

## Frontend Integration

### Supabase Client Setup

```typescript
// slmgenui/src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Auth Context

```typescript
// slmgenui/src/contexts/auth-context.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

### Protected Route Middleware

```typescript
// slmgenui/src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if ((request.nextUrl.pathname === '/login' || 
       request.nextUrl.pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup']
}
```

---

## Environment Variables

### Backend (.env)

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret

# Storage
SUPABASE_STORAGE_URL=https://your-project.supabase.co/storage/v1
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Never expose** `SUPABASE_SERVICE_KEY` to the frontend!

---

## Quick Reference

### Supabase Client Methods

| Method | Description |
|--------|-------------|
| `supabase.auth.signUp()` | Create new user |
| `supabase.auth.signInWithPassword()` | Email/password login |
| `supabase.auth.signOut()` | Log out user |
| `supabase.auth.getUser()` | Get current user |
| `supabase.auth.getSession()` | Get current session |
| `supabase.from('table').select()` | Query table |
| `supabase.from('table').insert()` | Insert rows |
| `supabase.from('table').update()` | Update rows |
| `supabase.from('table').delete()` | Delete rows |
| `supabase.storage.from('bucket').upload()` | Upload file |
| `supabase.storage.from('bucket').download()` | Download file |
| `supabase.storage.from('bucket').createSignedUrl()` | Get signed URL |

---

## Next Steps

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run SQL migrations to create tables
3. Configure auth providers in Supabase dashboard
4. Set environment variables
5. Install dependencies in both backend and frontend
6. Implement auth flow
7. Migrate existing session-based logic to Supabase
