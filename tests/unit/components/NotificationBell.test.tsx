/**
 * NotificationBell Component Tests
 * Tests for notification bell UI, badge display, and navigation
 */

import NotificationBell from '@/components/NotificationBell';
import { NotificationContext } from '@/context/NotificationContext';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

const mockPush = jest.fn();

// Mock router - inline factory
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    reload: jest.fn(),
  }),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const getBadgeText = (badge) => badge.findByType('Text').children[0];

  describe('Rendering', () => {
    it('should render notification bell icon', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 0, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(getByTestId('notification-bell')).toBeTruthy();
    });

    it('should not show badge when no unread notifications', () => {
      const { queryByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 0, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(queryByTestId('unread-badge')).toBeNull();
    });

    it('should show badge with count when there are unread notifications', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 5, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const badge = getByTestId('unread-badge');
      expect(badge).toBeTruthy();
      expect(getBadgeText(badge)).toBe('5');
    });

    it('should show "99+" for large unread counts', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 150, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const badge = getByTestId('unread-badge');
      expect(getBadgeText(badge)).toBe('99+');
    });
  });

  describe('Interaction', () => {
    it('should navigate to notifications screen on press', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 3, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const bellButton = getByTestId('notification-bell');
      fireEvent.press(bellButton);
      
      expect(mockPush).toHaveBeenCalledWith('/notifications');
    });

    it('should handle zero unread count gracefully', () => {
      const { queryByTestId, getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 0, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const bellButton = getByTestId('notification-bell');
      fireEvent.press(bellButton);
      
      expect(mockPush).toHaveBeenCalledWith('/notifications');
      expect(queryByTestId('unread-badge')).toBeNull();
    });

    it('should handle single unread notification', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 1, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const badge = getByTestId('unread-badge');
      expect(getBadgeText(badge)).toBe('1');
    });
  });

  describe('Visual Appearance', () => {
    it('should have correct styling classes', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 5, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const bellButton = getByTestId('notification-bell');
      expect(bellButton.props.className).toContain('relative');
      expect(bellButton.props.className).toContain('p-2');
    });

    it('should position badge correctly', () => {
      const { getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 3, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const badge = getByTestId('unread-badge');
      expect(badge.props.className).toContain('absolute');
      expect(badge.props.className).toContain('top-0');
      expect(badge.props.className).toContain('right-0');
    });
  });

  describe('Context Integration', () => {
    it('should subscribe to context changes', () => {
      const { rerender, getByTestId, queryByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 0, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(queryByTestId('unread-badge')).toBeNull();
      
      // Simulate new notification arriving
      rerender(
        <NotificationContext.Provider value={{ unreadCount: 2, notifications: [{}, {}] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const badge = getByTestId('unread-badge');
      expect(getBadgeText(badge)).toBe('2');
    });

    it('should handle context value updates', () => {
      const { rerender, getByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: 5, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(getBadgeText(getByTestId('unread-badge'))).toBe('5');
      
      // Simulate marking notifications as read
      rerender(
        <NotificationContext.Provider value={{ unreadCount: 0, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(getByTestId('notification-bell')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined context gracefully', () => {
      // Test with missing context values
      const { queryByTestId } = render(
        <NotificationContext.Provider value={{}}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(queryByTestId('unread-badge')).toBeNull();
    });

    it('should handle null unreadCount', () => {
      const { queryByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: null, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      expect(queryByTestId('unread-badge')).toBeNull();
    });

    it('should handle negative unreadCount (edge case)', () => {
      const { queryByTestId } = render(
        <NotificationContext.Provider value={{ unreadCount: -1, notifications: [] }}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      // Should not show badge for negative count
      expect(queryByTestId('unread-badge')).toBeNull();
    });
  });
});
