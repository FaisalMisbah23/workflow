ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS push_token TEXT;
