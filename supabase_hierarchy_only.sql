-- Hierarchy Migration - Safe to run multiple times
-- Adds columns with IF NOT EXISTS checks

-- ============================================
-- PART 1: ADD COLUMNS (Safe to rerun)
-- ============================================

DO $$
BEGIN
    -- Add role column to profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'lead', 'member'));
    END IF;
    
    -- Add org_id to profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
        ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
    END IF;
    
    -- Add lead_id to profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'lead_id') THEN
        ALTER TABLE public.profiles ADD COLUMN lead_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Add columns to tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'org_id') THEN
        ALTER TABLE public.tasks ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'assigned_by') THEN
        ALTER TABLE public.tasks ADD COLUMN assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'assigned_to_user_id') THEN
        ALTER TABLE public.tasks ADD COLUMN assigned_to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'tasks' AND column_name = 'escalated_to') THEN
        ALTER TABLE public.tasks ADD COLUMN escalated_to UUID[] DEFAULT '{}';
    END IF;
    
    -- Add org_id to invites if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'invites' AND column_name = 'role') THEN
        ALTER TABLE public.invites ADD COLUMN role TEXT DEFAULT 'member';
    END IF;
END $$;

-- Add org_id to notifications if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'notifications' AND column_name = 'org_id') THEN
            ALTER TABLE public.notifications ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- ============================================
-- PART 2: CREATE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID, org_uuid UUID)
RETURNS TEXT AS $$
DECLARE user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = user_uuid AND org_id = org_uuid;
  RETURN COALESCE(user_role, 'member');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_lead(user_uuid UUID)
RETURNS UUID AS $$
DECLARE lead_uuid UUID;
BEGIN
  SELECT lead_id INTO lead_uuid FROM public.profiles WHERE id = user_uuid;
  RETURN lead_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_org_admin(org_uuid UUID)
RETURNS UUID AS $$
DECLARE admin_uuid UUID;
BEGIN
  SELECT id INTO admin_uuid FROM public.profiles WHERE org_id = org_uuid AND role = 'admin' LIMIT 1;
  RETURN admin_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: NOTIFICATION FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID, p_title TEXT, p_message TEXT, p_type TEXT, p_task_id UUID
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, task_id)
  VALUES (p_user_id, p_title, p_message, p_type, p_task_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_upward(
  assignee_id UUID, task_id UUID, notification_title TEXT, notification_message TEXT, notification_type TEXT, org_id UUID
) RETURNS VOID AS $$
DECLARE
  lead_id UUID; admin_id UUID; user_org_id UUID;
BEGIN
  SELECT org_id INTO user_org_id FROM public.profiles WHERE id = assignee_id;
  IF user_org_id IS NULL THEN RETURN; END IF;
  
  INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
  VALUES (assignee_id, notification_title, notification_message, notification_type, task_id, org_id, false);
  
  SELECT lead_id INTO lead_id FROM public.profiles WHERE id = assignee_id;
  
  IF lead_id IS NOT NULL AND lead_id != assignee_id THEN
    INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
    VALUES (lead_id, notification_title, notification_message || ' (Team update)', notification_type, task_id, org_id, false);
    
    SELECT lead_id INTO admin_id FROM public.profiles WHERE id = lead_id;
    IF admin_id IS NOT NULL AND admin_id != lead_id AND admin_id != assignee_id THEN
      IF EXISTS (SELECT 1 FROM public.profiles WHERE id = admin_id AND role = 'admin') THEN
        INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
        VALUES (admin_id, notification_title, notification_message || ' (Org-wide update)', notification_type, task_id, org_id, false);
      END IF;
    END IF;
  END IF;
  
  IF lead_id IS NULL THEN
    SELECT id INTO admin_id FROM public.profiles WHERE org_id = user_org_id AND role = 'admin' LIMIT 1;
    IF admin_id IS NOT NULL AND admin_id != assignee_id THEN
      INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id, read)
      VALUES (admin_id, notification_title, notification_message || ' (Org-wide update)', notification_type, task_id, org_id, false);
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 5: TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS task_assignment_trigger ON public.tasks;
DROP TRIGGER IF EXISTS task_status_change_trigger ON public.tasks;

CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
DECLARE assignee_user_id UUID; assignee_org_id UUID;
BEGIN
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to != '' THEN
    SELECT id INTO assignee_user_id FROM auth.users WHERE email = NEW.assigned_to LIMIT 1;
    NEW.assigned_to_user_id := assignee_user_id;
  END IF;
  
  SELECT org_id INTO assignee_org_id FROM public.profiles WHERE id = NEW.created_by;
  NEW.org_id := assignee_org_id;
  NEW.assigned_by := NEW.created_by;
  
  IF assignee_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, message, type, task_id, org_id)
    VALUES (assignee_user_id, 'New Task Assigned', 'You have been assigned to task: ' || NEW.title, 'task_assigned', NEW.id, assignee_org_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_assignment_trigger BEFORE INSERT ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION handle_task_assignment();

CREATE OR REPLACE FUNCTION handle_task_status_change()
RETURNS TRIGGER AS $$
DECLARE assignee_org_id UUID; completion_message TEXT;
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT org_id INTO assignee_org_id FROM public.tasks WHERE id = NEW.id;
    completion_message := 'Task "' || NEW.title || '" has been marked as completed by ' || 
      COALESCE((SELECT fullname FROM public.profiles WHERE id = NEW.assigned_to_user_id), 'a team member');
    IF NEW.assigned_by IS NOT NULL THEN
      PERFORM notify_upward(NEW.assigned_by, NEW.id, 'Task Completed', completion_message, 'task_completed', assignee_org_id);
    ELSE
      PERFORM notify_upward(NEW.created_by, NEW.id, 'Task Completed', completion_message, 'task_completed', assignee_org_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER task_status_change_trigger AFTER UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION handle_task_status_change();

CREATE OR REPLACE FUNCTION check_missed_deadlines()
RETURNS void AS $$
DECLARE missed_task RECORD; assignee_lead UUID; escalation_message TEXT;
BEGIN
  FOR missed_task IN
    SELECT t.id, t.title, t.assigned_to_user_id, t.assigned_by, t.created_by, t.org_id, t.deadline, t.escalated_to
    FROM public.tasks t
    WHERE t.deadline < NOW() AND t.status != 'completed'
      AND (t.escalated_to IS NULL OR NOT (get_user_lead(t.assigned_to_user_id) = ANY(t.escalated_to)))
  LOOP
    escalation_message := 'Task "' || missed_task.title || '" has missed its deadline (' || 
      missed_task.deadline::text || '). Assigned to: ' ||
      COALESCE((SELECT fullname FROM public.profiles WHERE id = missed_task.assigned_to_user_id), 'Unknown');
    IF missed_task.assigned_by IS NOT NULL THEN
      PERFORM notify_upward(missed_task.assigned_by, missed_task.id, 'Deadline Missed - Escalation', escalation_message, 'deadline_missed', missed_task.org_id);
    ELSE
      PERFORM notify_upward(missed_task.created_by, missed_task.id, 'Deadline Missed - Escalation', escalation_message, 'deadline_missed', missed_task.org_id);
    END IF;
    SELECT lead_id INTO assignee_lead FROM public.profiles WHERE id = missed_task.assigned_to_user_id;
    IF assignee_lead IS NOT NULL THEN
      UPDATE public.tasks SET escalated_to = array_append(COALESCE(escalated_to, '{}'), assignee_lead) WHERE id = missed_task.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: RLS POLICIES (DROP & RECREATE)
-- ============================================

-- Drop all conflicting policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view org notifications" ON public.notifications;

-- Notifications
CREATE POLICY "Users can view org notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND org_id = notifications.org_id));

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Tasks
DROP POLICY IF EXISTS "Admins can view all org tasks" ON public.tasks;
DROP POLICY IF EXISTS "Leads can view team tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Assigners can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Creators can delete tasks" ON public.tasks;

CREATE POLICY "Admins can view all org tasks" ON public.tasks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND org_id = tasks.org_id));

CREATE POLICY "Leads can view team tasks" ON public.tasks
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'lead' AND p.org_id = tasks.org_id
    AND (tasks.created_by = auth.uid() OR tasks.assigned_by = auth.uid() OR tasks.assigned_to_user_id IN (SELECT id FROM public.profiles WHERE lead_id = auth.uid()))));

CREATE POLICY "Members can view own tasks" ON public.tasks
  FOR SELECT USING (tasks.assigned_to_user_id = auth.uid() OR tasks.created_by = auth.uid() OR tasks.assigned_by = auth.uid());

CREATE POLICY "Assigners can update tasks" ON public.tasks
  FOR UPDATE USING (tasks.created_by = auth.uid() OR tasks.assigned_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'lead') AND org_id = tasks.org_id));

CREATE POLICY "Creators can delete tasks" ON public.tasks
  FOR DELETE USING (tasks.created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin' AND org_id = tasks.org_id));

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view org profiles" ON public.profiles;

CREATE POLICY "Users can view org profiles" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR org_id IS NULL OR EXISTS (SELECT 1 FROM public.profiles p2 WHERE p2.id = auth.uid() AND p2.org_id = profiles.org_id));

-- ============================================
-- PART 7: HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION get_team_members(lead_uuid UUID)
RETURNS TABLE (id UUID, fullname TEXT, email TEXT, role TEXT) AS $$
BEGIN
  RETURN QUERY SELECT p.id, p.fullname, u.email, p.role FROM public.profiles p JOIN auth.users u ON p.id = u.id WHERE p.lead_id = lead_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION can_assign_to(assigner_id UUID, assignee_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  assigner_role TEXT; assigner_org_id UUID;
  assignee_role TEXT; assignee_org_id UUID; assignee_lead_id UUID;
BEGIN
  SELECT role, org_id INTO assigner_role, assigner_org_id FROM public.profiles WHERE id = assigner_id;
  SELECT p.role, p.org_id, p.lead_id INTO assignee_role, assignee_org_id, assignee_lead_id
    FROM public.profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = assignee_email;
  IF assignee_role IS NULL THEN RETURN assigner_role IN ('admin', 'lead'); END IF;
  IF assigner_org_id != assignee_org_id THEN RETURN false; END IF;
  IF assigner_role = 'admin' THEN RETURN true; END IF;
  IF assigner_role = 'lead' THEN RETURN assignee_lead_id = assigner_id OR assignee_role = 'member'; END IF;
  IF assigner_role = 'member' THEN RETURN assignee_email = (SELECT email FROM auth.users WHERE id = assigner_id); END IF;
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Hierarchy migration completed successfully!' as result;
