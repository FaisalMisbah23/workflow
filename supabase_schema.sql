-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  fullname TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  email TEXT,
  avatar_url TEXT,
  push_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS push_token TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invites table
CREATE TABLE IF NOT EXISTS public.invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'member',
  token UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

CREATE UNIQUE INDEX IF NOT EXISTS invites_org_email_unique
ON public.invites (org_id, lower(email))
WHERE email IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for organizations
CREATE POLICY "Users can view own organizations" ON public.organizations
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create organizations" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create policies for tasks
CREATE POLICY "Users can view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create policies for invites
CREATE POLICY "Users can view invites" ON public.invites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create invites" ON public.invites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
