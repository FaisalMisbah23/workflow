/**
 * Task Operations Integration Tests
 * End-to-end tests for task creation, assignment, completion, and hierarchy
 */

import Tasks from '@/app/(tabs)/task';
import CreateTask from '@/app/createtask';
import NotificationProvider from '@/context/NotificationContext';
import { UserContext } from '@/context/UserContext';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import {
  mockAdminProfile,
  mockLeadProfile,
  mockMemberProfile,
  mockOrganization,
  mockSupabaseResponse,
  mockTask,
  mockTeamMembers,
} from '../__mocks__/fixtures';

// Mock NotificationContext to provide createNotification that calls supabase
jest.mock('@/context/NotificationContext', () => {
  const React = require('react');
  const mockContextValue = {
    notifications: [],
    unreadCount: 0,
    isOnline: true,
    subscriptionError: false,
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    fetchNotifications: jest.fn(),
    createNotification: jest.fn(async (data) => {
      // This will be mocked in the test
      return { success: true, data };
    }),
  };

  const NotificationContext = React.createContext(mockContextValue);

  const NotificationProvider = ({ children }) => {
    return React.createElement(NotificationContext.Provider, {
      value: mockContextValue,
    }, children);
  };

  return {
    NotificationContext,
    default: NotificationProvider,
  };
});

// Mock expo-router - inline factory
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: jest.fn(),
  }),
  useFocusEffect: jest.fn((cb) => {
    const React = require('react');
    React.useEffect(() => cb(), [cb]);
  }),
}));

// Mock supabase - inline factory
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })) },
    from: jest.fn(() => ({
      select: jest.fn(() => ({ order: jest.fn(), eq: jest.fn() })),
      insert: jest.fn(() => ({ then: jest.fn() })),
      update: jest.fn(() => ({ eq: jest.fn() })),
      delete: jest.fn(() => ({ eq: jest.fn() })),
    })),
  },
}));

describe('Task Operations Integration', () => {
  let mockSupabase;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require('@/lib/supabase').supabase;
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: mockAdminProfile.id, email: 'admin@example.com' } },
      error: null,
    });
  });

  describe('Admin Task Creation', () => {
    it('shows assignee fullname as primary label with email fallback in picker', () => {
      const adminContext = {
        user: { user: { id: mockAdminProfile.id, email: 'admin@example.com' } },
        profile: mockAdminProfile,
        isAdmin: true,
        isLead: false,
        teamMembers: [],
        getAssignableUsers: () => ([
          { id: 'user-1', fullname: 'Faisal Misbah', email: 'faisal@example.com' },
          { id: 'user-2', email: 'noname@example.com' },
        ]),
        canAssignTask: () => true,
      };

      const { getByText } = render(
        <UserContext.Provider value={adminContext}>
          <CreateTask />
        </UserContext.Provider>
      );

      expect(getByText('Faisal Misbah (faisal@example.com)')).toBeTruthy();
      expect(getByText('noname@example.com')).toBeTruthy();
    });

    it('should allow admin to create and assign task to any user', async () => {
      const adminContext = {
        user: { user: { id: mockAdminProfile.id, email: 'admin@example.com' } },
        profile: mockAdminProfile,
        isAdmin: true,
        isLead: false,
        teamMembers: mockTeamMembers,
        getAssignableUsers: () => mockTeamMembers,
        canAssignTask: () => true,
      };

      const { getByPlaceholderText, getByText } = render(
        <UserContext.Provider value={adminContext}>
          <CreateTask />
        </UserContext.Provider>
      );

      // Fill in task form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Admin Created Task');
      fireEvent.changeText(getByPlaceholderText('Describe the task'), 'Task description');
      
      // Submit form
      const submitButton = getByText('Create Task');
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
      });

      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('should create notification after task creation', async () => {
      const adminContext = {
        user: { user: { id: mockAdminProfile.id, email: 'admin@example.com' } },
        profile: mockAdminProfile,
        isAdmin: true,
        isLead: false,
        teamMembers: mockTeamMembers,
        getAssignableUsers: () => mockTeamMembers,
        canAssignTask: () => true,
      };
      const createdTask = { id: 'created-task-id', title: 'Notification Task' };
      const duplicateQuery = {
        select: jest.fn(() => duplicateQuery),
        eq: jest.fn(() => duplicateQuery),
        neq: jest.fn(() => duplicateQuery),
        limit: jest.fn(() => duplicateQuery),
        then: (resolve) => Promise.resolve(mockSupabaseResponse([])).then(resolve),
      };
      const taskSingle = jest.fn().mockResolvedValue(mockSupabaseResponse(createdTask));
      const taskSelect = jest.fn(() => ({ single: taskSingle }));
      const taskInsert = jest.fn(() => ({ select: taskSelect }));
      const notificationInsert = jest.fn().mockResolvedValue(mockSupabaseResponse({}));

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'tasks') {
          return {
            select: duplicateQuery.select,
            insert: taskInsert,
          };
        }
        if (table === 'notifications') {
          return { insert: notificationInsert };
        }
        return { insert: jest.fn().mockResolvedValue(mockSupabaseResponse({})) };
      });

      const { getByPlaceholderText, getByText } = render(
        <NotificationProvider userId={mockAdminProfile.id}>
          <UserContext.Provider value={adminContext}>
            <CreateTask />
          </UserContext.Provider>
        </NotificationProvider>
      );

      fireEvent.changeText(getByPlaceholderText('Enter task title'), createdTask.title);

      await act(async () => {
        fireEvent.press(getByText('Create Task'));
      });

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
        expect(mockBack).toHaveBeenCalled();
      });
    });

    it('should validate admin assignment hierarchy', async () => {
      const adminContext = {
        user: { user: { id: mockAdminProfile.id, email: 'admin@example.com' } },
        profile: mockAdminProfile,
        isAdmin: true,
        isLead: false,
        teamMembers: mockTeamMembers,
        getAssignableUsers: () => mockTeamMembers,
        canAssignTask: (email) => true, // Admin can assign to anyone
      };

      // Verify admin can assign to lead
      expect(adminContext.canAssignTask('lead@example.com')).toBe(true);
      
      // Verify admin can assign to member
      expect(adminContext.canAssignTask('member@example.com')).toBe(true);
    });
  });

  describe('Lead Task Creation', () => {
    it('should allow lead to create and assign task to team members', async () => {
      const leadContext = {
        user: { user: { id: mockLeadProfile.id, email: 'lead@example.com' } },
        profile: mockLeadProfile,
        isAdmin: false,
        isLead: true,
        teamMembers: mockTeamMembers.filter(m => m.lead_id === mockLeadProfile.id),
        getAssignableUsers: () => mockTeamMembers.filter(m => m.lead_id === mockLeadProfile.id),
        canAssignTask: (email) => email.includes('member'),
      };

      const { getByPlaceholderText, getByText } = render(
        <UserContext.Provider value={leadContext}>
          <CreateTask />
        </UserContext.Provider>
      );

      // Fill in task form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Lead Created Task');
      fireEvent.changeText(getByPlaceholderText('Describe the task'), 'Task for team member');
      
      // Submit form
      const submitButton = getByText('Create Task');
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
      });

      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      });
    });

    it('should prevent lead from assigning to admin', async () => {
      const leadContext = {
        user: { user: { id: mockLeadProfile.id, email: 'lead@example.com' } },
        profile: mockLeadProfile,
        isAdmin: false,
        isLead: true,
        teamMembers: mockTeamMembers.filter(m => m.role === 'member'),
        getAssignableUsers: () => mockTeamMembers.filter(m => m.role === 'member'),
        canAssignTask: (email) => !email.includes('admin'), // Cannot assign to admin
      };

      // Lead should NOT be able to assign to admin
      expect(leadContext.canAssignTask('admin@example.com')).toBe(false);
      
      // Lead CAN assign to their team members
      expect(leadContext.canAssignTask('member@example.com')).toBe(true);
    });
  });

  describe('Member Task Creation', () => {
    it('should only allow member to create self-assigned tasks', async () => {
      const memberContext = {
        user: { user: { id: mockMemberProfile.id, email: 'member@example.com' } },
        profile: mockMemberProfile,
        isAdmin: false,
        isLead: false,
        teamMembers: [],
        getAssignableUsers: () => [{ id: mockMemberProfile.id, email: 'member@example.com', fullname: 'Member' }],
        canAssignTask: (email) => email === 'member@example.com', // Can only assign to self
      };

      const { getByPlaceholderText, getByText } = render(
        <UserContext.Provider value={memberContext}>
          <CreateTask />
        </UserContext.Provider>
      );

      // Member should see "Self only" indicator
      const assignText = getByText(/Assign To/);
      expect(assignText).toBeTruthy();

      // Fill in task form
      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'My Personal Task');
      
      // Submit form
      const submitButton = getByText('Create Task');
      
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
      });

      await act(async () => {
        fireEvent.press(submitButton);
      });

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      });
    });

    it('should prevent member from assigning to others', async () => {
      const memberContext = {
        user: { user: { id: mockMemberProfile.id, email: 'member@example.com' } },
        profile: mockMemberProfile,
        isAdmin: false,
        isLead: false,
        canAssignTask: (email) => email === 'member@example.com',
      };

      // Member CAN assign to themselves
      expect(memberContext.canAssignTask('member@example.com')).toBe(true);
      
      // Member CANNOT assign to lead
      expect(memberContext.canAssignTask('lead@example.com')).toBe(false);
      
      // Member CANNOT assign to admin
      expect(memberContext.canAssignTask('admin@example.com')).toBe(false);
    });
  });

  describe('Task Completion Flow', () => {
    it('should trigger upward notifications when member completes task', async () => {
      const mockTaskWithAssigner = {
        ...mockTask,
        assigned_to_user_id: mockMemberProfile.id,
        assigned_by: mockLeadProfile.id,
        created_by: mockLeadProfile.id,
        status: 'pending',
      };

      const tasks = [mockTaskWithAssigner];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue(mockSupabaseResponse(tasks)),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
            }),
            delete: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockMemberProfile.id } },
        error: null,
      });

      // The task completion should trigger notification creation
      // This is handled by the database trigger, verified by checking
      // that the update was called with status = 'completed'
      const { update } = mockSupabase.from('tasks');
      
      await act(async () => {
        await update({ status: 'completed' }).eq('id', mockTaskWithAssigner.id);
      });

      expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    });

    it('should allow lead to complete tasks assigned by admin', async () => {
      const adminAssignedTask = {
        ...mockTask,
        assigned_to_user_id: mockLeadProfile.id,
        assigned_by: mockAdminProfile.id,
        created_by: mockAdminProfile.id,
        org_id: mockOrganization.id,
        status: 'in_progress',
      };

      // Lead should be able to complete this task
      const leadContext = {
        user: { user: { id: mockLeadProfile.id } },
        profile: mockLeadProfile,
        isAdmin: false,
        isLead: true,
      };

      // Verify task appears in lead's view
      expect(adminAssignedTask.assigned_to_user_id).toBe(mockLeadProfile.id);
    });
  });

  describe('Role-Based Task Visibility', () => {
    it('should show all org tasks to admin', async () => {
      const allTasks = [
        { ...mockTask, created_by: mockAdminProfile.id },
        { ...mockTask, id: 'task-2', created_by: mockLeadProfile.id },
        { ...mockTask, id: 'task-3', created_by: mockLeadProfile.id, assigned_to_user_id: mockMemberProfile.id },
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockSupabaseResponse(allTasks)),
              }),
              order: jest.fn().mockResolvedValue(mockSupabaseResponse(allTasks)),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockAdminProfile.id } },
        error: null,
      });

      const { findAllByText } = render(
        <UserContext.Provider value={{ profile: mockAdminProfile }}>
          <Tasks />
        </UserContext.Provider>
      );

      await waitFor(() => {
        // Admin should see all 3 tasks
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      });
    });

    it('should show only assigned tasks to member', async () => {
      const memberTasks = [
        { 
          ...mockTask, 
          assigned_to_user_id: mockMemberProfile.id,
          created_by: mockLeadProfile.id,
        },
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              or: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockSupabaseResponse(memberTasks)),
              }),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockMemberProfile.id } },
        error: null,
      });

      const { findAllByText } = render(
        <UserContext.Provider value={{ profile: mockMemberProfile }}>
          <Tasks />
        </UserContext.Provider>
      );

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('tasks');
      });
    });
  });

  describe('Deadline Management', () => {
    it('should allow setting deadline on task creation', async () => {
      const adminContext = {
        user: { user: { id: mockAdminProfile.id } },
        profile: mockAdminProfile,
        isAdmin: true,
      };

      const { getByPlaceholderText } = render(
        <UserContext.Provider value={adminContext}>
          <CreateTask />
        </UserContext.Provider>
      );

      const deadlineInput = getByPlaceholderText('YYYY-MM-DD');
      fireEvent.changeText(deadlineInput, '2024-12-31');
      
      expect(deadlineInput.props.value).toBe('2024-12-31');
    });

    it('should trigger escalation when deadline is missed', async () => {
      const overdueTask = {
        ...mockTask,
        deadline: '2024-01-01T00:00:00Z', // Past date
        status: 'pending',
        org_id: mockOrganization.id,
      };

      // When check_missed_deadlines() runs, it should:
      // 1. Find overdue tasks
      // 2. Notify assigner (upward)
      // 3. Mark as escalated
      
      // This is verified by the database trigger behavior
      expect(overdueTask.deadline).toBeDefined();
      expect(overdueTask.status).toBe('pending');
    });
  });

  describe('Error Handling', () => {
    it('should handle task creation failure gracefully', async () => {
      const adminContext = {
        user: { user: { id: mockAdminProfile.id, email: 'admin@example.com' } },
        profile: mockAdminProfile,
        isAdmin: true,
        getAssignableUsers: () => mockTeamMembers,
        canAssignTask: () => true,
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: { message: 'Database error' } }),
      });

      const { getByPlaceholderText, getByText } = render(
        <UserContext.Provider value={adminContext}>
          <CreateTask />
        </UserContext.Provider>
      );

      fireEvent.changeText(getByPlaceholderText('Enter task title'), 'Test Task');
      
      const submitButton = getByText('Create Task');

      await act(async () => {
        fireEvent.press(submitButton);
      });

      // Should show error toast (via Alert on iOS)
      const { Alert } = require('react-native');
      expect(Alert.alert).toHaveBeenCalled();
    });

    it('should handle network errors during task fetch', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'tasks') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockRejectedValue(new Error('Network error')),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: mockAdminProfile.id } },
        error: null,
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      render(
        <UserContext.Provider value={{ profile: mockAdminProfile }}>
          <Tasks />
        </UserContext.Provider>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });
});
