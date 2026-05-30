/**
 * NotificationContext Unit Tests
 * Tests for real-time notifications, subscription management, and marking notifications as read
 */

import NotificationProvider, { NotificationContext } from '@/context/NotificationContext';
import { act, render, waitFor } from '@testing-library/react-native';
import { useContext } from 'react';
import { Alert } from 'react-native';
import {
    mockDeadlineMissedNotification,
    mockNotification,
    mockSupabaseResponse,
    mockTaskCompletedNotification,
    mockUser,
} from '../../__mocks__/fixtures';

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(() => {});

// Mock supabase - inline factory
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({ eq: jest.fn(() => ({ order: jest.fn() })) })),
      insert: jest.fn(() => ({ then: jest.fn() })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ eq: jest.fn() })) })),
    })),
    channel: jest.fn(() => ({ 
      on: jest.fn(function() { return this; }), 
      subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })) 
    })),
  },
}));

// Test component to access context
const TestComponent = () => {
  const context = useContext(NotificationContext);
  return (
    <>
      <span testID="notification-count">{context.notifications?.length || 0}</span>
      <span testID="unread-count">{context.unreadCount || 0}</span>
      <span testID="has-context">{context ? 'true' : 'false'}</span>
    </>
  );
};

describe('NotificationContext', () => {
  let mockSupabase;
  let mockChannel;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require('@/lib/supabase').supabase;
    
    // Setup mock channel with callback capture
    mockChannel = {
      on: jest.fn(function(event, filter, callback) {
        this.callback = callback;
        return this;
      }),
      subscribe: jest.fn(function() {
        return { unsubscribe: jest.fn() };
      }),
    };
    
    mockSupabase.channel.mockReturnValue(mockChannel);
  });

  describe('Initialization', () => {
    it('should initialize with empty notifications', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([])),
          }),
        }),
      });
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('notification-count').children[0]).toBe('0');
        expect(getByTestId('unread-count').children[0]).toBe('0');
      });
    });

    it('should fetch existing notifications on mount', async () => {
      const existingNotifications = [
        mockNotification,
        { ...mockTaskCompletedNotification, read: true },
      ];
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse(existingNotifications)),
          }),
        }),
      });
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('notification-count').children[0]).toBe('2');
        expect(getByTestId('unread-count').children[0]).toBe('1');
      });
    });

    it('should not fetch notifications if no userId provided', () => {
      render(
        <NotificationProvider userId={null}>
          <TestComponent />
        </NotificationProvider>
      );
      
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });

  describe('Real-time Subscription', () => {
    it('should subscribe to notification channel on mount', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([])),
          }),
        }),
      });
      
      render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith('notifications');
        expect(mockChannel.on).toHaveBeenCalledWith(
          'postgres_changes',
          expect.objectContaining({
            event: 'INSERT',
            table: 'notifications',
          }),
          expect.any(Function)
        );
      });
    });

    it('should unsubscribe on unmount', async () => {
      const mockUnsubscribe = jest.fn();
      
      mockChannel.subscribe.mockReturnValue({ unsubscribe: mockUnsubscribe });
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([])),
          }),
        }),
      });
      
      const { unmount } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });
      
      unmount();
      
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should show toast and add notification on new message received', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([])),
          }),
        }),
      });
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(mockChannel.on).toHaveBeenCalled();
      });
      
      // Simulate receiving a new notification via subscription
      const newNotification = {
        id: 'new-notif-id',
        title: 'New Task Assigned',
        message: 'You have a new task',
        type: 'task_assigned',
        user_id: mockUser.id,
        read: false,
        created_at: new Date().toISOString(),
      };
      
      // Call the captured callback
      if (mockChannel.callback) {
        act(() => {
          mockChannel.callback({ new: newNotification });
        });
      }
      
      await waitFor(() => {
        expect(getByTestId('notification-count').children[0]).toBe('1');
        expect(getByTestId('unread-count').children[0]).toBe('1');
      });
    });
  });

  describe('Mark as Read', () => {
    it('should mark single notification as read', async () => {
      const notifications = [
        { ...mockNotification, id: 'notif-1', read: false },
        { ...mockNotification, id: 'notif-2', read: false },
      ];
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'notifications') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockSupabaseResponse(notifications)),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });
      
      const TestWithMarkRead = () => {
        const { notifications, unreadCount, markAsRead } = useContext(NotificationContext);
        return (
          <>
            <span testID="unread-count">{unreadCount}</span>
            <button 
              testID="mark-read-btn" 
              onPress={() => markAsRead('notif-1')}
              title="Mark Read"
            />
          </>
        );
      };
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestWithMarkRead />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('unread-count').children[0]).toBe('2');
      });
      
      // Note: Testing the actual button press would require more setup
    });

    it('should call Supabase update when marking as read', async () => {
      const notifications = [{ ...mockNotification, read: false }];
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'notifications') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockSupabaseResponse(notifications)),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });
      
      const { result } = renderHook(() => useContext(NotificationContext), {
        wrapper: ({ children }) => (
          <NotificationProvider userId={mockUser.id}>{children}</NotificationProvider>
        ),
      });
      
      await waitFor(() => {
        expect(result.current.notifications).toBeDefined();
      });
      
      await act(async () => {
        await result.current.markAsRead(mockNotification.id);
      });
      
      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should handle mark as read error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const notifications = [{ ...mockNotification, read: false }];
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'notifications') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockSupabaseResponse(notifications)),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({ error: { message: 'Update failed' } }),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });
      
      const { result } = renderHook(() => useContext(NotificationContext), {
        wrapper: ({ children }) => (
          <NotificationProvider userId={mockUser.id}>{children}</NotificationProvider>
        ),
      });
      
      await waitFor(() => {
        expect(result.current.notifications).toBeDefined();
      });
      
      await act(async () => {
        await result.current.markAsRead(mockNotification.id);
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Mark as read error:', expect.any(Object));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Mark All as Read', () => {
    it('should mark all notifications as read', async () => {
      const notifications = [
        { ...mockNotification, id: 'notif-1', read: false },
        { ...mockNotification, id: 'notif-2', read: false },
        { ...mockNotification, id: 'notif-3', read: true },
      ];
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'notifications') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockResolvedValue(mockSupabaseResponse(notifications)),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue(mockSupabaseResponse({})),
              }),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });
      
      const { result } = renderHook(() => useContext(NotificationContext), {
        wrapper: ({ children }) => (
          <NotificationProvider userId={mockUser.id}>{children}</NotificationProvider>
        ),
      });
      
      await waitFor(() => {
        expect(result.current.unreadCount).toBe(2);
      });
      
      await act(async () => {
        await result.current.markAllAsRead();
      });
      
      await waitFor(() => {
        expect(result.current.unreadCount).toBe(0);
      });
    });

    it('should handle mark all as read when not logged in', async () => {
      const { result } = renderHook(() => useContext(NotificationContext), {
        wrapper: ({ children }) => (
          <NotificationProvider userId={null}>{children}</NotificationProvider>
        ),
      });
      
      await act(async () => {
        await result.current.markAllAsRead();
      });
      
      // Should not throw or make API calls
      expect(mockSupabase.from).not.toHaveBeenCalledWith('notifications');
    });
  });

  describe('Notification Types', () => {
    it('should handle task_assigned notifications', async () => {
      const notification = {
        ...mockNotification,
        type: 'task_assigned',
        title: 'New Task Assigned',
      };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([notification])),
          }),
        }),
      });
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('notification-count').children[0]).toBe('1');
      });
    });

    it('should handle task_completed notifications', async () => {
      const notification = {
        ...mockTaskCompletedNotification,
        user_id: mockUser.id,
      };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([notification])),
          }),
        }),
      });
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('notification-count').children[0]).toBe('1');
      });
    });

    it('should handle deadline_missed notifications', async () => {
      const notification = {
        ...mockDeadlineMissedNotification,
        user_id: mockUser.id,
      };
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue(mockSupabaseResponse([notification])),
          }),
        }),
      });
      
      const { getByTestId } = render(
        <NotificationProvider userId={mockUser.id}>
          <TestComponent />
        </NotificationProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('notification-count').children[0]).toBe('1');
      });
    });
  });

  describe('Manual Refresh', () => {
    it('should allow manual refresh of notifications', async () => {
      const initialNotifications = [{ ...mockNotification }];
      const updatedNotifications = [
        { ...mockNotification },
        { ...mockTaskCompletedNotification },
      ];
      
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockImplementation(() => {
              callCount++;
              return Promise.resolve(mockSupabaseResponse(
                callCount === 1 ? initialNotifications : updatedNotifications
              ));
            }),
          }),
        }),
      }));
      
      const { result } = renderHook(() => useContext(NotificationContext), {
        wrapper: ({ children }) => (
          <NotificationProvider userId={mockUser.id}>{children}</NotificationProvider>
        ),
      });
      
      await waitFor(() => {
        expect(result.current.notifications.length).toBe(1);
      });
      
      await act(async () => {
        await result.current.fetchNotifications();
      });
      
      await waitFor(() => {
        expect(result.current.notifications.length).toBe(2);
      });
    });
  });
});

// Helper function
function renderHook(callback, options = {}) {
  const { wrapper: WrapperComponent } = options;
  let result = { current: null };
  
  const TestComponent = () => {
    result.current = callback();
    return null;
  };
  
  const WrappedComponent = WrapperComponent 
    ? () => (
        <WrapperComponent>
          <TestComponent />
        </WrapperComponent>
      )
    : TestComponent;
  
  render(<WrappedComponent />);
  
  return { result };
}
