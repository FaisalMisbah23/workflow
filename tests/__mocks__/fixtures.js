/**
 * Test Fixtures
 * Reusable test data for consistent testing
 */

// ============================================
// USER FIXTURES
// ============================================

export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  user_metadata: {
    fullname: 'Test User',
  },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockSession = {
  user: mockUser,
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: 1234567890,
};

export const mockAdminUser = {
  id: 'admin-user-id-456',
  email: 'admin@example.com',
  user_metadata: {
    fullname: 'Admin User',
  },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockLeadUser = {
  id: 'lead-user-id-789',
  email: 'lead@example.com',
  user_metadata: {
    fullname: 'Lead User',
  },
  created_at: '2024-01-01T00:00:00Z',
};

export const mockMemberUser = {
  id: 'member-user-id-abc',
  email: 'member@example.com',
  user_metadata: {
    fullname: 'Member User',
  },
  created_at: '2024-01-01T00:00:00Z',
};

// ============================================
// PROFILE FIXTURES
// ============================================

export const mockProfile = {
  id: 'test-user-id-123',
  fullname: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  role: 'member',
  org_id: 'test-org-id',
  lead_id: null,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAdminProfile = {
  id: 'admin-user-id-456',
  fullname: 'Admin User',
  avatar_url: 'https://example.com/admin-avatar.jpg',
  role: 'admin',
  org_id: 'test-org-id',
  lead_id: null,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockLeadProfile = {
  id: 'lead-user-id-789',
  fullname: 'Lead User',
  avatar_url: 'https://example.com/lead-avatar.jpg',
  role: 'lead',
  org_id: 'test-org-id',
  lead_id: 'admin-user-id-456',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockMemberProfile = {
  id: 'member-user-id-abc',
  fullname: 'Member User',
  avatar_url: 'https://example.com/member-avatar.jpg',
  role: 'member',
  org_id: 'test-org-id',
  lead_id: 'lead-user-id-789',
  created_at: '2024-01-01T00:00:00Z',
};

// ============================================
// ORGANIZATION FIXTURES
// ============================================

export const mockOrganization = {
  id: 'test-org-id',
  name: 'Test Organization',
  description: 'A test organization',
  created_by: 'admin-user-id-456',
  created_at: '2024-01-01T00:00:00Z',
};

// ============================================
// TASK FIXTURES
// ============================================

export const mockTask = {
  id: 'task-id-001',
  title: 'Test Task',
  description: 'This is a test task',
  priority: 'Medium',
  status: 'pending',
  assigned_to: 'member@example.com',
  assigned_to_user_id: 'member-user-id-abc',
  assigned_by: 'lead-user-id-789',
  created_by: 'lead-user-id-789',
  org_id: 'test-org-id',
  deadline: '2024-12-31T23:59:59Z',
  escalated_to: [],
  created_at: '2024-01-01T00:00:00Z',
};

export const mockHighPriorityTask = {
  id: 'task-id-002',
  title: 'High Priority Task',
  description: 'Urgent task that needs attention',
  priority: 'High',
  status: 'in_progress',
  assigned_to: 'member@example.com',
  assigned_to_user_id: 'member-user-id-abc',
  assigned_by: 'lead-user-id-789',
  created_by: 'lead-user-id-789',
  org_id: 'test-org-id',
  deadline: '2024-06-15T23:59:59Z',
  escalated_to: [],
  created_at: '2024-01-02T00:00:00Z',
};

export const mockCompletedTask = {
  id: 'task-id-003',
  title: 'Completed Task',
  description: 'This task has been completed',
  priority: 'Low',
  status: 'completed',
  assigned_to: 'member@example.com',
  assigned_to_user_id: 'member-user-id-abc',
  assigned_by: 'lead-user-id-789',
  created_by: 'lead-user-id-789',
  org_id: 'test-org-id',
  deadline: null,
  escalated_to: [],
  created_at: '2024-01-03T00:00:00Z',
};

export const mockOverdueTask = {
  id: 'task-id-004',
  title: 'Overdue Task',
  description: 'This task is overdue',
  priority: 'High',
  status: 'pending',
  assigned_to: 'member@example.com',
  assigned_to_user_id: 'member-user-id-abc',
  assigned_by: 'lead-user-id-789',
  created_by: 'lead-user-id-789',
  org_id: 'test-org-id',
  deadline: '2024-01-01T00:00:00Z', // Past date
  escalated_to: [],
  created_at: '2024-01-04T00:00:00Z',
};

export const createMockTask = (overrides = {}) => ({
  id: `task-id-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Mock Task',
  description: 'Mock description',
  priority: 'Medium',
  status: 'pending',
  assigned_to: null,
  assigned_to_user_id: null,
  assigned_by: null,
  created_by: 'test-user-id-123',
  org_id: null,
  deadline: null,
  escalated_to: [],
  created_at: new Date().toISOString(),
  ...overrides,
});

// ============================================
// NOTIFICATION FIXTURES
// ============================================

export const mockNotification = {
  id: 'notif-id-001',
  user_id: 'test-user-id-123',
  title: 'New Task Assigned',
  message: 'You have been assigned to task: Test Task',
  type: 'task_assigned',
  task_id: 'task-id-001',
  org_id: 'test-org-id',
  read: false,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockTaskCompletedNotification = {
  id: 'notif-id-002',
  user_id: 'lead-user-id-789',
  title: 'Task Completed',
  message: 'Task "Completed Task" has been marked as completed',
  type: 'task_completed',
  task_id: 'task-id-003',
  org_id: 'test-org-id',
  read: false,
  created_at: '2024-01-05T00:00:00Z',
};

export const mockDeadlineMissedNotification = {
  id: 'notif-id-003',
  user_id: 'lead-user-id-789',
  title: 'Deadline Missed - Escalation',
  message: 'Task "Overdue Task" has missed its deadline',
  type: 'deadline_missed',
  task_id: 'task-id-004',
  org_id: 'test-org-id',
  read: false,
  created_at: '2024-01-06T00:00:00Z',
};

export const createMockNotification = (overrides = {}) => ({
  id: `notif-id-${Math.random().toString(36).substr(2, 9)}`,
  user_id: 'test-user-id-123',
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'task_assigned',
  task_id: null,
  org_id: 'test-org-id',
  read: false,
  created_at: new Date().toISOString(),
  ...overrides,
});

// ============================================
// INVITE FIXTURES
// ============================================

export const mockInvite = {
  id: 'invite-id-001',
  org_id: 'test-org-id',
  user_id: 'admin-user-id-456',
  token: 'invite-token-123',
  role: 'member',
  created_at: '2024-01-01T00:00:00Z',
};

// ============================================
// TEAM MEMBERS FIXTURES
// ============================================

export const mockTeamMembers = [
  mockAdminProfile,
  mockLeadProfile,
  mockMemberProfile,
  {
    id: 'member-2-id',
    fullname: 'Second Member',
    avatar_url: null,
    role: 'member',
    org_id: 'test-org-id',
    lead_id: 'lead-user-id-789',
    created_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================
// SUPABASE RESPONSE FIXTURES
// ============================================

export const mockSupabaseResponse = (data = null, error = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

export const mockSupabaseError = (message = 'Test error', code = 'TEST_ERROR') => ({
  data: null,
  error: {
    message,
    code,
    details: null,
    hint: null,
  },
  status: 400,
  statusText: 'Bad Request',
});

// ============================================
// NAVIGATION FIXTURES
// ============================================

export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  navigate: jest.fn(),
  reload: jest.fn(),
  setParams: jest.fn(),
};

// ============================================
// FORM DATA FIXTURES
// ============================================

export const validTaskForm = {
  title: 'New Test Task',
  description: 'Task description',
  priority: 'High',
  assignTo: 'member@example.com',
  deadline: '2024-12-31',
};

export const invalidTaskForm = {
  title: '', // Empty title - should fail validation
  description: '',
  priority: 'Medium',
  assignTo: '',
  deadline: '',
};

export const validLoginForm = {
  email: 'test@example.com',
  password: 'securePassword123',
};

export const invalidLoginForm = {
  email: 'invalid-email',
  password: '123', // Too short
};

// ============================================
// TEST STATE BUILDERS
// ============================================

export const buildUserState = (overrides = {}) => ({
  user: mockSession,
  isLoggedIn: true,
  profile: mockProfile,
  Org: [mockOrganization],
  avatarUrl: mockProfile.avatar_url,
  isAdmin: false,
  isLead: false,
  teamMembers: [],
  loading: false,
  ...overrides,
});

export const buildAdminState = () => buildUserState({
  user: { ...mockSession, user: mockAdminUser },
  profile: mockAdminProfile,
  isAdmin: true,
  isLead: false,
  teamMembers: mockTeamMembers,
});

export const buildLeadState = () => buildUserState({
  user: { ...mockSession, user: mockLeadUser },
  profile: mockLeadProfile,
  isAdmin: false,
  isLead: true,
  teamMembers: mockTeamMembers.filter(m => m.role === 'member'),
});

export const buildMemberState = () => buildUserState({
  user: { ...mockSession, user: mockMemberUser },
  profile: mockMemberProfile,
  isAdmin: false,
  isLead: false,
  teamMembers: [],
});
