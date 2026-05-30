-- Notifications table for in-app notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'task_assigned', 'task_completed', 'deadline_missed'
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure task assignee ID is available for policy-safe lookups.
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Normalize legacy assigned_to values and backfill assigned_to_user_id.
UPDATE public.tasks
SET assigned_to = lower(trim(assigned_to))
WHERE assigned_to IS NOT NULL;

UPDATE public.tasks t
SET assigned_to_user_id = u.id
FROM auth.users u
WHERE t.assigned_to_user_id IS NULL
  AND t.assigned_to IS NOT NULL
  AND lower(t.assigned_to) = lower(u.email);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_task_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, task_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_task_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle task assignment notification
CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assignee_id UUID;
BEGIN
  assignee_id := NEW.assigned_to_user_id;

  IF assignee_id IS NULL AND NEW.assigned_to IS NOT NULL AND NEW.assigned_to != '' THEN
    SELECT id INTO assignee_id
    FROM auth.users
    WHERE lower(email) = lower(NEW.assigned_to)
    LIMIT 1;
  END IF;

  IF assignee_id IS NOT NULL THEN
    PERFORM create_notification(
      assignee_id,
      'New Task Assigned',
      'You have been assigned to task: ' || NEW.title,
      'task_assigned',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle task status change
CREATE OR REPLACE FUNCTION handle_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If task marked as completed, notify the creator
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM create_notification(
      NEW.created_by,
      'Task Completed',
      'Task "' || NEW.title || '" has been marked as completed',
      'task_completed',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS task_assignment_trigger ON public.tasks;
CREATE TRIGGER task_assignment_trigger
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_assignment();

DROP TRIGGER IF EXISTS task_status_change_trigger ON public.tasks;
CREATE TRIGGER task_status_change_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_status_change();

-- Function to check missed deadlines (run via cron)
CREATE OR REPLACE FUNCTION check_missed_deadlines()
RETURNS void AS $$
DECLARE
  missed_task RECORD;
BEGIN
  FOR missed_task IN
    SELECT id, title, created_by, deadline
    FROM public.tasks
    WHERE deadline < NOW()
      AND status != 'completed'
      AND deadline > NOW() - INTERVAL '1 day' -- Only notify once per day
  LOOP
    PERFORM create_notification(
      missed_task.created_by,
      'Deadline Missed',
      'Task "' || missed_task.title || '" has missed its deadline',
      'deadline_missed',
      missed_task.id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update task policies to allow assignees to view tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON public.tasks;

CREATE POLICY "Users can view assigned tasks" ON public.tasks
  FOR SELECT USING (
    auth.uid() = created_by
    OR assigned_to_user_id = auth.uid()
    OR (
      assigned_to IS NOT NULL
      AND lower(assigned_to) = lower(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), ''))
    )
  );

CREATE POLICY "Users can update assigned tasks" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = created_by
    OR assigned_to_user_id = auth.uid()
    OR (
      assigned_to IS NOT NULL
      AND lower(assigned_to) = lower(COALESCE((SELECT email FROM auth.users WHERE id = auth.uid()), ''))
    )
  );
