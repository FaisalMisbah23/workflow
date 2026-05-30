-- Organization Hierarchy Schema
-- Roles: admin, lead, member

-- Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'lead', 'member'));

-- Add org_id to profiles for organization membership
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add lead_id to profiles for Members to know their Lead
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Add push_token to profiles for push notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Update tasks table to track assignment hierarchy
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add escalated_to field for deadline tracking
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS escalated_to UUID[] DEFAULT '{}';

-- Update notifications table to support role-based notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.invites
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

CREATE UNIQUE INDEX IF NOT EXISTS invites_org_email_unique
ON public.invites (org_id, lower(email))
WHERE email IS NOT NULL;

-- Function to get user's role in organization
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID, org_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_uuid AND org_id = org_uuid;
  
  RETURN COALESCE(user_role, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's lead
CREATE OR REPLACE FUNCTION get_user_lead(user_uuid UUID)
RETURNS UUID AS $$
DECLARE
  lead_uuid UUID;
BEGIN
  SELECT lead_id INTO lead_uuid
  FROM public.profiles
  WHERE id = user_uuid;
  
  RETURN lead_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get organization's admin
CREATE OR REPLACE FUNCTION get_org_admin(org_uuid UUID)
RETURNS UUID AS $$
DECLARE
  admin_uuid UUID;
BEGIN
  SELECT id INTO admin_uuid
  FROM public.profiles
  WHERE org_id = org_uuid AND role = 'admin'
  LIMIT 1;
  
  RETURN admin_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify up the hierarchy
CREATE OR REPLACE FUNCTION notify_upward(
  assignee_id UUID,
  task_id UUID,
  notification_title TEXT,
  notification_message TEXT,
  notification_type TEXT,
  org_id UUID
) RETURNS VOID AS $$
DECLARE
  lead_id UUID;
  admin_id UUID;
  user_org_id UUID;
BEGIN
  -- Get user's organization
  SELECT org_id INTO user_org_id
  FROM public.profiles
  WHERE id = assignee_id;
  
  IF user_org_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Notify the assignee (for task completion, this is the person who assigned)
  INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
  VALUES (assignee_id, notification_title, notification_message, notification_type, task_id, org_id, false);
  
  -- Get the assignee's lead
  SELECT lead_id INTO lead_id
  FROM public.profiles
  WHERE id = assignee_id;
  
  -- Notify the lead if exists and not already notified
  IF lead_id IS NOT NULL AND lead_id != assignee_id THEN
    INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
    VALUES (lead_id, notification_title, notification_message || ' (Team update)', notification_type, task_id, org_id, false);
    
    -- Get the lead's admin
    SELECT lead_id INTO admin_id
    FROM public.profiles
    WHERE id = lead_id;
    
    -- If lead has an admin above them, notify admin too
    IF admin_id IS NOT NULL AND admin_id != lead_id AND admin_id != assignee_id THEN
      -- Check if admin is actually an admin
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id AND role = 'admin') THEN
        INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
        VALUES (admin_id, notification_title, notification_message || ' (Org-wide update)', notification_type, task_id, org_id, false);
      END IF;
    END IF;
  END IF;
  
  -- If no lead, notify org admin directly
  IF lead_id IS NULL THEN
    SELECT id INTO admin_id
    FROM public.profiles
    WHERE org_id = user_org_id AND role = 'admin'
    LIMIT 1;
    
    IF admin_id IS NOT NULL AND admin_id != assignee_id THEN
      INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
      VALUES (admin_id, notification_title, notification_message || ' (Org-wide update)', notification_type, task_id, org_id, false);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS task_assignment_trigger ON public.tasks;
DROP FUNCTION IF EXISTS handle_task_assignment();

-- New task assignment trigger with hierarchy
CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  assigner_role TEXT;
  assignee_org_id UUID;
  assignee_user_id UUID;
BEGIN
  -- Get assignee's user ID if assigned_to is an email
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != '' THEN
    SELECT id INTO assignee_user_id
    FROM auth.users
    WHERE email = NEW.assigned_to
    LIMIT 1;
    
    NEW.assigned_to_user_id := assignee_user_id;
  END IF;
  
  -- Get assigner's role
  SELECT role, org_id INTO assigner_role, assignee_org_id
  FROM public.profiles
  WHERE id = NEW.created_by;
  
  NEW.org_id := assignee_org_id;
  NEW.assigned_by := NEW.created_by;
  
  -- Notify the assignee
  IF assignee_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id)
    VALUES (
      assignee_user_id,
      'New Task Assigned',
      'You have been assigned to task: ' || NEW.title,
      'task_assigned',
      NEW.id,
      assignee_org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_assignment_trigger
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_assignment();

-- Drop existing status change trigger
DROP TRIGGER IF EXISTS task_status_change_trigger ON public.tasks;
DROP FUNCTION IF EXISTS handle_task_status_change();

-- New status change trigger with upward notification
CREATE OR REPLACE FUNCTION handle_task_status_change()
RETURNS TRIGGER AS $$
DECLARE
  assigner_id UUID;
  assignee_org_id UUID;
  completion_message TEXT;
BEGIN
  -- If task marked as completed, notify upward
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get the org ID
    SELECT org_id INTO assignee_org_id
    FROM public.tasks
    WHERE id = NEW.id;
    
    completion_message := 'Task "' || NEW.title || '" has been marked as completed by ' || 
      COALESCE((SELECT fullname FROM public.profiles WHERE id = NEW.assigned_to_user_id), 'a team member');
    
    -- Notify the assigner (upward)
    IF NEW.assigned_by IS NOT NULL THEN
      PERFORM notify_upward(
        NEW.assigned_by,
        NEW.id,
        'Task Completed',
        completion_message,
        'task_completed',
        assignee_org_id
      );
    ELSE
      -- Fallback to created_by
      PERFORM notify_upward(
        NEW.created_by,
        NEW.id,
        'Task Completed',
        completion_message,
        'task_completed',
        assignee_org_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_status_change_trigger
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION handle_task_status_change();

-- Function to check missed deadlines with escalation
CREATE OR REPLACE FUNCTION check_missed_deadlines()
RETURNS void AS $$
DECLARE
  missed_task RECORD;
  assignee_lead UUID;
  escalation_message TEXT;
BEGIN
  FOR missed_task IN
    SELECT t.id, t.title, t.assigned_to_user_id, t.assigned_by, t.created_by, t.org_id, t.deadline, t.escalated_to
    FROM public.tasks t
    WHERE t.deadline < NOW()
      AND t.status != 'completed'
      AND (t.escalated_to IS NULL OR NOT (get_user_lead(t.assigned_to_user_id) = ANY(t.escalated_to)))
  LOOP
    escalation_message := 'Task "' || missed_task.title || '" has missed its deadline (' || 
      missed_task.deadline::text || '). Assigned to: ' ||
      COALESCE((SELECT fullname FROM public.profiles WHERE id = missed_task.assigned_to_user_id), 'Unknown');
    
    -- Notify upward about missed deadline
    IF missed_task.assigned_by IS NOT NULL THEN
      PERFORM notify_upward(
        missed_task.assigned_by,
        missed_task.id,
        'Deadline Missed - Escalation',
        escalation_message,
        'deadline_missed',
        missed_task.org_id
      );
    ELSE
      PERFORM notify_upward(
        missed_task.created_by,
        missed_task.id,
        'Deadline Missed - Escalation',
        escalation_message,
        'deadline_missed',
        missed_task.org_id
      );
    END IF;
    
    -- Mark as escalated to lead
    SELECT lead_id INTO assignee_lead
    FROM public.profiles
    WHERE id = missed_task.assigned_to_user_id;
    
    IF assignee_lead IS NOT NULL THEN
      UPDATE public.tasks
      SET escalated_to = array_append(COALESCE(escalated_to, '{}'), assignee_lead)
      WHERE id = missed_task.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for role-based access

-- Drop existing task policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update assigned tasks" ON public.tasks;

-- New policy: Admins can see all tasks in their org
CREATE POLICY "Admins can view all org tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND org_id = tasks.org_id
    )
  );

-- New policy: Leads can see tasks they created, assigned to them, or their team's tasks
CREATE POLICY "Leads can view team tasks" ON public.tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'lead'
      AND p.org_id = tasks.org_id
      AND (
        tasks.created_by = auth.uid()
        OR tasks.assigned_by = auth.uid()
        OR tasks.assigned_to_user_id IN (
          SELECT id FROM public.profiles WHERE lead_id = auth.uid()
        )
      )
    )
  );

-- New policy: Members can see tasks assigned to them or they created
CREATE POLICY "Members can view own tasks" ON public.tasks
  FOR SELECT USING (
    tasks.assigned_to_user_id = auth.uid()
    OR tasks.created_by = auth.uid()
    OR tasks.assigned_by = auth.uid()
  );

-- New policy: Users can create tasks (assignment flow enforced in app)
CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- New policy: Only assigner or admin can update
CREATE POLICY "Assigners can update tasks" ON public.tasks
  FOR UPDATE USING (
    tasks.created_by = auth.uid()
    OR tasks.assigned_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'lead')
      AND org_id = tasks.org_id
    )
  );

-- New policy: Only creator or admin can delete
CREATE POLICY "Creators can delete tasks" ON public.tasks
  FOR DELETE USING (
    tasks.created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND org_id = tasks.org_id
    )
  );

-- Update notification policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- New notification policies with org visibility
CREATE POLICY "Users can view org notifications" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      AND org_id = notifications.org_id
    )
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Update profile policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- New policy: Users can view profiles in same org
CREATE POLICY "Users can view org profiles" ON public.profiles
  FOR SELECT USING (
    id = auth.uid()
    OR org_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid() 
      AND p2.org_id = profiles.org_id
    )
  );

-- Helper function to get team members for a lead
CREATE OR REPLACE FUNCTION get_team_members(lead_uuid UUID)
RETURNS TABLE (id UUID, fullname TEXT, email TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.fullname, u.email, p.role
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.lead_id = lead_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to validate assignment hierarchy
CREATE OR REPLACE FUNCTION can_assign_to(assigner_id UUID, assignee_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  assigner_role TEXT;
  assigner_org_id UUID;
  assignee_role TEXT;
  assignee_org_id UUID;
  assignee_lead_id UUID;
BEGIN
  -- Get assigner info
  SELECT role, org_id INTO assigner_role, assigner_org_id
  FROM public.profiles
  WHERE id = assigner_id;
  
  -- Get assignee info
  SELECT p.role, p.org_id, p.lead_id 
  INTO assignee_role, assignee_org_id, assignee_lead_id
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE u.email = assignee_email;
  
  -- If no assignee found, check if email exists in auth.users
  IF assignee_role IS NULL THEN
    -- New user, allow assignment (they'll be added to org on signup)
    RETURN assigner_role IN ('admin', 'lead');
  END IF;
  
  -- Must be in same org
  IF assigner_org_id != assignee_org_id THEN
    RETURN false;
  END IF;
  
  -- Hierarchy check
  -- Admin can assign to anyone in org
  IF assigner_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Lead can assign to their team members
  IF assigner_role = 'lead' THEN
    RETURN assignee_lead_id = assigner_id OR assignee_role = 'member';
  END IF;
  
  -- Member can only assign to themselves (self-task)
  IF assigner_role = 'member' THEN
    RETURN assignee_email = (SELECT email FROM auth.users WHERE id = assigner_id);
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
