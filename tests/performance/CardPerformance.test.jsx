/**
 * Card Component Performance Tests
 * Tests for Card component render performance and re-render optimization
 */

import Card from '@/components/Card';
import { UserContext } from '@/context/UserContext';
import { render } from '@testing-library/react-native';
import { Profiler } from 'react';

// Performance metrics collector
const cardMetrics = {
  mountDuration: [],
  updateDuration: [],
};

const onCardRender = (id, phase, actualDuration) => {
  if (phase === 'mount') {
    cardMetrics.mountDuration.push(actualDuration);
  } else if (phase === 'update') {
    cardMetrics.updateDuration.push(actualDuration);
  }
};

// Mock UserContext
const mockUserContext = {
  user: { id: '1', email: 'test@example.com' },
  profile: { role: 'admin' },
  teamMembers: [],
  organizations: [],
  isLoggedIn: true,
  isAdmin: true,
  isLead: false,
};

describe('Card Component Performance', () => {
  beforeEach(() => {
    cardMetrics.mountDuration = [];
    cardMetrics.updateDuration = [];
  });

  describe('Mount Performance', () => {
    it('should mount within acceptable time (< 200ms)', () => {
      const startTime = performance.now();
      
      render(
        <UserContext.Provider value={mockUserContext}>
          <Card />
        </UserContext.Provider>
      );
      
      const endTime = performance.now();
      const mountTime = endTime - startTime;
      
      expect(mountTime).toBeLessThan(200);
    });

    it('should track mount performance with Profiler', () => {
      render(
        <UserContext.Provider value={mockUserContext}>
          <Profiler id="Card" onRender={onCardRender}>
            <Card />
          </Profiler>
        </UserContext.Provider>
      );

      expect(cardMetrics.mountDuration.length).toBeGreaterThan(0);
      expect(cardMetrics.mountDuration[0]).toBeLessThan(200);
    });
  });

  describe('Re-render Performance', () => {
    it('should re-render efficiently when context changes', () => {
      const { rerender } = render(
        <UserContext.Provider value={mockUserContext}>
          <Profiler id="Card" onRender={onCardRender}>
            <Card />
          </Profiler>
        </UserContext.Provider>
      );

      const updatedContext = {
        ...mockUserContext,
        teamMembers: [{ id: '2', name: 'New Member' }],
      };

      const startTime = performance.now();
      rerender(
        <UserContext.Provider value={updatedContext}>
          <Profiler id="Card" onRender={onCardRender}>
            <Card />
          </Profiler>
        </UserContext.Provider>
      );
      const endTime = performance.now();

      const updateDuration = endTime - startTime;
      expect(updateDuration).toBeLessThan(100);
      expect(cardMetrics.updateDuration.length).toBeGreaterThan(0);
    });

    it('should not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const CountingCard = () => {
        renderCount++;
        return <Card />;
      };

      const { rerender } = render(
        <UserContext.Provider value={mockUserContext}>
          <CountingCard />
        </UserContext.Provider>
      );

      const initialCount = renderCount;
      
      // Re-render with same context
      rerender(
        <UserContext.Provider value={mockUserContext}>
          <CountingCard />
        </UserContext.Provider>
      );

      // Should ideally not re-render if properly memoized
      expect(renderCount).toBeLessThanOrEqual(initialCount + 1);
    });
  });

  describe('Large Data Performance', () => {
    it('should handle large team member lists efficiently', () => {
      const largeTeam = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        name: `Team Member ${i}`,
      }));

      const largeContext = {
        ...mockUserContext,
        teamMembers: largeTeam,
      };

      const startTime = performance.now();
      render(
        <UserContext.Provider value={largeContext}>
          <Card />
        </UserContext.Provider>
      );
      const endTime = performance.now();

      const mountTime = endTime - startTime;
      expect(mountTime).toBeLessThan(100);
    });
  });

  describe('Performance Thresholds', () => {
    it('should maintain consistent mount times across multiple renders', () => {
      const measurements = [];
      
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        render(
          <UserContext.Provider value={mockUserContext}>
            <Card />
          </UserContext.Provider>
        );
        const endTime = performance.now();
        measurements.push(endTime - startTime);
      }

      const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      const max = Math.max(...measurements);
      const min = Math.min(...measurements);

      // Variance should be less than 200%
      const variance = (max - min) / average;
      expect(variance).toBeLessThan(2.0);
      expect(average).toBeLessThan(100);
    });
  });
});
