/**
 * NotificationBell Component Performance Tests
 * Tests for NotificationBell component render performance and update efficiency
 */

import NotificationBell from '@/components/NotificationBell';
import { NotificationContext } from '@/context/NotificationContext';
import { render } from '@testing-library/react-native';
import { Profiler } from 'react';

// Performance metrics collector
const notificationMetrics = {
  mountDuration: [],
  updateDuration: [],
};

const onNotificationRender = (id, phase, actualDuration) => {
  if (phase === 'mount') {
    notificationMetrics.mountDuration.push(actualDuration);
  } else if (phase === 'update') {
    notificationMetrics.updateDuration.push(actualDuration);
  }
};

// Mock NotificationContext
const mockNotificationContext = {
  notifications: [],
  unreadCount: 0,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
};

describe('NotificationBell Component Performance', () => {
  beforeEach(() => {
    notificationMetrics.mountDuration = [];
    notificationMetrics.updateDuration = [];
    jest.clearAllMocks();
  });

  describe('Mount Performance', () => {
    it('should mount within acceptable time (< 500ms)', () => {
      const startTime = performance.now();
      
      render(
        <NotificationContext.Provider value={mockNotificationContext}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      
      const endTime = performance.now();
      const mountTime = endTime - startTime;
      
      expect(mountTime).toBeLessThan(500);
    });

    it('should track mount performance with Profiler', () => {
      render(
        <NotificationContext.Provider value={mockNotificationContext}>
          <Profiler id="NotificationBell" onRender={onNotificationRender}>
            <NotificationBell />
          </Profiler>
        </NotificationContext.Provider>
      );

      expect(notificationMetrics.mountDuration.length).toBeGreaterThan(0);
      expect(notificationMetrics.mountDuration[0]).toBeLessThan(500);
    });
  });

  describe('Update Performance', () => {
    it('should re-render efficiently when notifications change', () => {
      const { rerender } = render(
        <NotificationContext.Provider value={mockNotificationContext}>
          <Profiler id="NotificationBell" onRender={onNotificationRender}>
            <NotificationBell />
          </Profiler>
        </NotificationContext.Provider>
      );

      const updatedContext = {
        ...mockNotificationContext,
        notifications: [
          { id: '1', message: 'New notification', read: false },
        ],
        unreadCount: 1,
      };

      const startTime = performance.now();
      rerender(
        <NotificationContext.Provider value={updatedContext}>
          <Profiler id="NotificationBell" onRender={onNotificationRender}>
            <NotificationBell />
          </Profiler>
        </NotificationContext.Provider>
      );
      const endTime = performance.now();

      const updateDuration = endTime - startTime;
      expect(updateDuration).toBeLessThan(20);
      expect(notificationMetrics.updateDuration.length).toBeGreaterThan(0);
    });
  });

  describe('Large Data Performance', () => {
    it('should handle large notification lists efficiently', () => {
      const largeNotifications = Array.from({ length: 50 }, (_, i) => ({
        id: i.toString(),
        message: `Notification ${i}`,
        read: false,
      }));

      const largeContext = {
        ...mockNotificationContext,
        notifications: largeNotifications,
        unreadCount: 50,
      };

      const startTime = performance.now();
      render(
        <NotificationContext.Provider value={largeContext}>
          <NotificationBell />
        </NotificationContext.Provider>
      );
      const endTime = performance.now();

      const mountTime = endTime - startTime;
      expect(mountTime).toBeLessThan(50);
    });
  });

  describe('Performance Thresholds', () => {
    it('should maintain consistent mount times', () => {
      const measurements = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        render(
          <NotificationContext.Provider value={mockNotificationContext}>
            <NotificationBell />
          </NotificationContext.Provider>
        );
        const endTime = performance.now();
        measurements.push(endTime - startTime);
      }

      const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(average).toBeLessThan(30);
    });
  });
});
