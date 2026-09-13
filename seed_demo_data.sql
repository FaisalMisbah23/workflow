-- ============================================
-- DATABASE SEED SCRIPT FOR WORKFLOW APP
-- ============================================
-- INSTRUCTIONS:
-- 1. Sign up via the app with sheikhshahib123@gmail.com
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Run this script
-- ============================================

-- Step 1: Create your organization
INSERT INTO public.organizations (id, name, description, created_by)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Workflow Dev Team',
  'A software development organization focused on building innovative productivity tools.',
  (SELECT id FROM auth.users WHERE email = 'sheikhshahib123@gmail.com' LIMIT 1)
);

-- Step 2: Update your profile as admin
UPDATE public.profiles
SET 
  fullname = 'Shahib Sheikh',
  role = 'admin',
  org_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  bio = 'Founder & Lead Developer'
WHERE id = (SELECT id FROM auth.users WHERE email = 'sheikhshahib123@gmail.com' LIMIT 1);

-- ============================================
-- STEP 3: CREATE TEAM MEMBERS
-- ============================================

-- Lead 1: Frontend Team Lead
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alice.johnson@workflowdev.com',
  crypt('Workflow@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, fullname, username, bio, email, role, org_id, lead_id)
VALUES (
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'Alice Johnson',
  'alice_j',
  'Frontend specialist with 5 years React Native experience',
  'alice.johnson@workflowdev.com',
  'lead',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Lead 2: Backend Team Lead
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'bob.smith@workflowdev.com',
  crypt('Workflow@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, fullname, username, bio, email, role, org_id, lead_id)
VALUES (
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'Bob Smith',
  'bob_smith',
  'Backend engineer specializing in Supabase and APIs',
  'bob.smith@workflowdev.com',
  'lead',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Member 1: Junior Developer (under Alice)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'carol.davis@workflowdev.com',
  crypt('Workflow@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, fullname, username, bio, email, role, org_id, lead_id)
VALUES (
  'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'Carol Davis',
  'carol_d',
  'Junior developer learning React Native',
  'carol.davis@workflowdev.com',
  'member',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
)
ON CONFLICT (id) DO NOTHING;

-- Member 2: Junior Developer (under Alice)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'david.wilson@workflowdev.com',
  crypt('Workflow@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, fullname, username, bio, email, role, org_id, lead_id)
VALUES (
  'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  'David Wilson',
  'david_w',
  'UI/UX focused developer',
  'david.wilson@workflowdev.com',
  'member',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
)
ON CONFLICT (id) DO NOTHING;

-- Member 3: Backend Developer (under Bob)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'emma.brown@workflowdev.com',
  crypt('Workflow@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, fullname, username, bio, email, role, org_id, lead_id)
VALUES (
  'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
  'Emma Brown',
  'emma_b',
  'Database and API specialist',
  'emma.brown@workflowdev.com',
  'member',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
)
ON CONFLICT (id) DO NOTHING;

-- Member 4: DevOps (under Bob)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'frank.miller@workflowdev.com',
  crypt('Workflow@2026', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, fullname, username, bio, email, role, org_id, lead_id)
VALUES (
  'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
  'Frank Miller',
  'frank_m',
  'DevOps engineer, CI/CD and deployment',
  'frank.miller@workflowdev.com',
  'member',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: CREATE TASKS
-- ============================================

DO $$
DECLARE
  v_admin_id UUID;
  v_alice_id UUID := 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
  v_bob_id UUID := 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
  v_carol_id UUID := 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a14';
  v_david_id UUID := 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a15';
  v_emma_id UUID := 'f5eebc99-9c0b-4ef8-bb6d-6bb9bd380a16';
  v_frank_id UUID := 'a6eebc99-9c0b-4ef8-bb6d-6bb9bd380a17';
  v_org_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  v_parent_id UUID;
BEGIN
  -- Get admin ID
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'sheikhshahib123@gmail.com' LIMIT 1;

  -- ==========================================
  -- PENDING TASKS (To Do)
  -- ==========================================
  
  INSERT INTO public.tasks (title, description, priority, status, assigned_to, deadline, created_by, org_id, assigned_by)
  VALUES 
  ('Design System Documentation', 'Create comprehensive documentation for the design system including color tokens, typography, spacing, and component usage guidelines.', 'High', 'pending', 'alice.johnson@workflowdev.com', NOW() + INTERVAL '7 days', v_admin_id, v_org_id, v_admin_id),
  
  ('API Rate Limiting', 'Implement rate limiting on all public API endpoints to prevent abuse. Use Redis for tracking request counts.', 'High', 'pending', 'bob.smith@workflowdev.com', NOW() + INTERVAL '5 days', v_admin_id, v_org_id, v_admin_id),
  
  ('User Onboarding Flow', 'Design and implement a new user onboarding experience with interactive tutorials and progress tracking.', 'Medium', 'pending', 'carol.davis@workflowdev.com', NOW() + INTERVAL '10 days', v_alice_id, v_org_id, v_alice_id),
  
  ('Database Migration Script', 'Write migration scripts for the new schema changes including backup procedures and rollback plans.', 'Medium', 'pending', 'emma.brown@workflowdev.com', NOW() + INTERVAL '3 days', v_bob_id, v_org_id, v_bob_id),
  
  ('Mobile App Performance Audit', 'Conduct a thorough performance audit of the mobile app including startup time, memory usage, and network requests.', 'Low', 'pending', 'david.wilson@workflowdev.com', NOW() + INTERVAL '14 days', v_admin_id, v_org_id, v_admin_id);

  -- ==========================================
  -- IN PROGRESS TASKS
  -- ==========================================
  
  INSERT INTO public.tasks (title, description, priority, status, assigned_to, deadline, created_by, org_id, assigned_by)
  VALUES 
  ('Voice AI Integration', 'Complete the voice-to-task pipeline with error handling, retry logic, and user feedback.', 'High', 'in_progress', 'alice.johnson@workflowdev.com', NOW() + INTERVAL '2 days', v_admin_id, v_org_id, v_admin_id),
  
  ('Push Notification System', 'Implement push notifications for task assignments, deadline reminders, and team updates using Expo Notifications.', 'High', 'in_progress', 'frank.miller@workflowdev.com', NOW() + INTERVAL '4 days', v_bob_id, v_org_id, v_bob_id),
  
  ('Task Comments Feature', 'Add threaded comments on tasks with real-time updates and notification support.', 'Medium', 'in_progress', 'carol.davis@workflowdev.com', NOW() + INTERVAL '6 days', v_alice_id, v_org_id, v_alice_id),
  
  ('Role-Based Access Control', 'Implement and test RBAC for admin, lead, and member roles across all features.', 'High', 'in_progress', 'emma.brown@workflowdev.com', NOW() + INTERVAL '1 day', v_bob_id, v_org_id, v_bob_id),
  
  ('Dark Mode Implementation', 'Add dark mode support with theme persistence and system preference detection.', 'Medium', 'in_progress', 'david.wilson@workflowdev.com', NOW() + INTERVAL '3 days', v_alice_id, v_org_id, v_alice_id);

  -- ==========================================
  -- COMPLETED TASKS
  -- ==========================================
  
  INSERT INTO public.tasks (title, description, priority, status, assigned_to, deadline, created_by, org_id, assigned_by, created_at)
  VALUES 
  ('User Authentication Setup', 'Set up Supabase Auth with email/password, social login, and password reset functionality.', 'High', 'completed', 'bob.smith@workflowdev.com', NOW() - INTERVAL '5 days', v_admin_id, v_org_id, v_admin_id, NOW() - INTERVAL '10 days'),
  
  ('Database Schema Design', 'Design and implement the initial database schema with tables for users, organizations, tasks, and notifications.', 'High', 'completed', 'emma.brown@workflowdev.com', NOW() - INTERVAL '7 days', v_bob_id, v_org_id, v_bob_id, NOW() - INTERVAL '14 days'),
  
  ('Project Setup', 'Initialize the React Native project with Expo, configure TypeScript, set up navigation and basic folder structure.', 'Medium', 'completed', 'alice.johnson@workflowdev.com', NOW() - INTERVAL '12 days', v_admin_id, v_org_id, v_admin_id, NOW() - INTERVAL '20 days'),
  
  ('UI Component Library', 'Create reusable UI components including Button, Card, Modal, Input, and Badge with NativeWind styling.', 'Medium', 'completed', 'david.wilson@workflowdev.com', NOW() - INTERVAL '8 days', v_alice_id, v_org_id, v_alice_id, NOW() - INTERVAL '15 days'),
  
  ('CI/CD Pipeline', 'Set up GitHub Actions for automated testing, building, and deployment to Expo and app stores.', 'Low', 'completed', 'frank.miller@workflowdev.com', NOW() - INTERVAL '3 days', v_bob_id, v_org_id, v_bob_id, NOW() - INTERVAL '8 days');

  -- ==========================================
  -- TASK HIERARCHY (Parent-Child for Tree View)
  -- ==========================================
  
  -- Get the parent task ID (Voice AI Integration)
  SELECT id INTO v_parent_id FROM public.tasks 
  WHERE title = 'Voice AI Integration' AND org_id = v_org_id LIMIT 1;
  
  -- Make some tasks children of Voice AI Integration
  UPDATE public.tasks 
  SET parent_task_id = v_parent_id
  WHERE title IN ('User Onboarding Flow', 'Mobile App Performance Audit')
  AND org_id = v_org_id;

  -- ==========================================
  -- NOTIFICATIONS
  -- ==========================================
  
  INSERT INTO public.notifications (user_id, title, message, type, read, created_at)
  VALUES
  (v_admin_id, 'Welcome to Workflow!', 'Your organization has been created. Start by inviting team members and creating tasks.', 'task_assigned', false, NOW() - INTERVAL '1 day'),
  (v_admin_id, 'New Task Completed', 'Alice Johnson completed "Project Setup"', 'task_completed', false, NOW() - INTERVAL '2 hours'),
  (v_admin_id, 'Deadline Reminder', 'Task "API Rate Limiting" is due in 5 days', 'deadline_reminder', true, NOW() - INTERVAL '1 day'),
  (v_alice_id, 'Task Assigned', 'You have been assigned to "Voice AI Integration"', 'task_assigned', false, NOW() - INTERVAL '3 hours'),
  (v_alice_id, 'Team Update', 'New team member Carol Davis has joined the Frontend team', 'team_invite', true, NOW() - INTERVAL '2 days'),
  (v_bob_id, 'Task Assigned', 'You have been assigned to "Push Notification System"', 'task_assigned', false, NOW() - INTERVAL '1 day'),
  (v_carol_id, 'Welcome!', 'Welcome to the Workflow Dev Team! Check your assigned tasks.', 'team_invite', false, NOW() - INTERVAL '3 days'),
  (v_carol_id, 'Task Assigned', 'You have been assigned to "User Onboarding Flow"', 'task_assigned', false, NOW() - INTERVAL '5 hours');

END $$;

-- ============================================
-- STEP 5: VERIFY DATA
-- ============================================

-- Check organization
SELECT 'Organization:' as info, name, description FROM public.organizations;

-- Check team members
SELECT 
  p.fullname,
  p.role,
  p.email,
  CASE 
    WHEN p.role = 'admin' THEN 'N/A'
    WHEN p.lead_id IS NULL THEN 'N/A'
    ELSE (SELECT fullname FROM public.profiles WHERE id = p.lead_id)
  END as reports_to
FROM public.profiles p
WHERE p.org_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
ORDER BY p.role, p.fullname;

-- Check tasks by status
SELECT 
  status,
  COUNT(*) as count
FROM public.tasks
WHERE org_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
GROUP BY status;

-- Check notifications
SELECT COUNT(*) as total_notifications FROM public.notifications;

-- ============================================
-- SEED DATA SUMMARY
-- ============================================
-- Organization: Workflow Dev Team
-- Team: 1 Admin, 2 Leads, 4 Members
-- Tasks: 5 pending, 5 in progress, 5 completed
-- Notifications: 8
--
-- Login credentials:
-- sheikhshahib123@gmail.com (your account - Admin)
-- alice.johnson@workflowdev.com / Workflow@2026 (Lead)
-- bob.smith@workflowdev.com / Workflow@2026 (Lead)
-- carol.davis@workflowdev.com / Workflow@2026 (Member)
-- david.wilson@workflowdev.com / Workflow@2026 (Member)
-- emma.brown@workflowdev.com / Workflow@2026 (Member)
-- frank.miller@workflowdev.com / Workflow@2026 (Member)
-- ============================================
