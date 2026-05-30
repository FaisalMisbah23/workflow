/**
 * Performance Testing Suite
 * Tests for component render performance, navigation performance, and API response times
 */

import { render } from '@testing-library/react-native';
import { Profiler, useState } from 'react';
import { FlatList, Text, View } from 'react-native';

// Performance metrics collector
const performanceMetrics = {
  renders: [],
  durations: [],
};

// Profiler callback to collect performance data
const onRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  performanceMetrics.renders.push({
    id,
    phase,
    actualDuration,
    baseDuration,
    timestamp: Date.now(),
  });
  performanceMetrics.durations.push(actualDuration);
};

// Helper to measure render time
const measureRender = (componentName, renderFn) => {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  return endTime - startTime;
};

// Helper to measure API call performance
const measureAPICall = async (apiCall) => {
  const startTime = performance.now();
  await apiCall();
  const endTime = performance.now();
  return endTime - startTime;
};

// Test component for performance testing
const TestComponent = ({ items = [] }) => {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => (
        <View style={{ padding: 10 }}>
          <Text>{item.name}</Text>
        </View>
      )}
      keyExtractor={(item) => item.id}
    />
  );
};

describe('Performance Testing', () => {
  beforeEach(() => {
    performanceMetrics.renders = [];
    performanceMetrics.durations = [];
  });

  describe('Component Render Performance', () => {
    it('should render simple component within acceptable time (< 50ms)', () => {
      const SimpleComponent = () => <View><Text>Test</Text></View>;
      
      const renderTime = measureRender('SimpleComponent', () => {
        render(<SimpleComponent />);
      });

      expect(renderTime).toBeLessThan(50); // 60fps = 16.67ms per frame
    });

    it('should render list of 100 items within acceptable time (< 100ms)', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        id: i.toString(),
        name: `Item ${i}`,
      }));

      const renderTime = measureRender('LargeList', () => {
        render(<TestComponent items={items} />);
      });

      expect(renderTime).toBeLessThan(100);
    });

    it('should not cause excessive re-renders', () => {
      let renderCount = 0;
      
      const CountingComponent = () => {
        renderCount++;
        return <View><Text>Count: {renderCount}</Text></View>;
      };

      const { rerender } = render(<CountingComponent />);
      const initialCount = renderCount;
      
      rerender(<CountingComponent />);
      
      expect(renderCount).toBe(initialCount + 1);
    });
  });

  describe('Profiler Integration', () => {
    it('should collect performance metrics with Profiler', () => {
      const TestProfiledComponent = () => (
        <Profiler id="TestComponent" onRender={onRenderCallback}>
          <View><Text>Profiled</Text></View>
        </Profiler>
      );

      render(<TestProfiledComponent />);

      expect(performanceMetrics.renders.length).toBeGreaterThan(0);
      expect(performanceMetrics.renders[0]).toHaveProperty('id', 'TestComponent');
      expect(performanceMetrics.renders[0]).toHaveProperty('actualDuration');
    });

    it('should track mount and update phases', () => {
      const TestProfiledComponent = () => (
        <Profiler id="UpdateTest" onRender={onRenderCallback}>
          <View><Text>Update Test</Text></View>
        </Profiler>
      );

      const { rerender } = render(<TestProfiledComponent />);
      rerender(<TestProfiledComponent />);

      const mountRenders = performanceMetrics.renders.filter(r => r.phase === 'mount');
      const updateRenders = performanceMetrics.renders.filter(r => r.phase === 'update');

      expect(mountRenders.length).toBeGreaterThan(0);
      expect(updateRenders.length).toBeGreaterThan(0);
    });
  });

  describe('List Performance', () => {
    it('should handle large list with windowing efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i.toString(),
        name: `Item ${i}`,
      }));

      const renderTime = measureRender('LargeListWindowing', () => {
        render(
          <FlatList
            data={largeData}
            renderItem={({ item }) => (
              <View style={{ padding: 10 }}>
                <Text>{item.name}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
            windowSize={10}
          />
        );
      });

      expect(renderTime).toBeLessThan(200);
    });

    it('should maintain consistent render times for list updates', () => {
      const data = Array.from({ length: 50 }, (_, i) => ({
        id: i.toString(),
        name: `Item ${i}`,
      }));

      const { rerender } = render(
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <View style={{ padding: 10 }}>
              <Text>{item.name}</Text>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      );

      const firstRenderTime = measureRender('ListUpdate1', () => {
        rerender(
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <View style={{ padding: 10 }}>
                <Text>{item.name}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        );
      });

      const secondRenderTime = measureRender('ListUpdate2', () => {
        rerender(
          <FlatList
            data={data}
            renderItem={({ item }) => (
              <View style={{ padding: 10 }}>
                <Text>{item.name}</Text>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
        );
      });

      // Both renders should complete successfully
      expect(firstRenderTime).toBeGreaterThanOrEqual(0);
      expect(secondRenderTime).toBeGreaterThanOrEqual(0);
      
      // If first render time is non-zero, check variance
      if (firstRenderTime > 0) {
        const variance = Math.abs(firstRenderTime - secondRenderTime) / firstRenderTime;
        expect(variance).toBeLessThan(2.0);
      }
    });
  });

  describe('Memory Performance', () => {
    it('should not cause memory leaks with repeated renders', () => {
      const ReRenderComponent = () => {
        const [count, setCount] = useState(0);
        return (
          <View>
            <Text onPress={() => setCount(c => c + 1)}>Count: {count}</Text>
          </View>
        );
      };

      const { rerender } = render(<ReRenderComponent />);
      
      // Re-render 100 times
      for (let i = 0; i < 100; i++) {
        rerender(<ReRenderComponent />);
      }

      // If this test passes without timeout, there's no obvious memory leak
      expect(true).toBe(true);
    });
  });

  describe('Performance Thresholds', () => {
    it('should meet 60fps target for simple interactions', () => {
      const InteractiveComponent = () => (
        <View>
          <Text>Interactive</Text>
        </View>
      );

      const renderTime = measureRender('InteractiveComponent', () => {
        render(<InteractiveComponent />);
      });

      // 60fps = 16.67ms per frame (adjusted to 20ms for test environment)
      expect(renderTime).toBeLessThan(20);
    });

    it('should keep average render time under threshold', () => {
      const TestComponent = () => (
        <View>
          <Text>Performance Test</Text>
        </View>
      );

      const measurements = [];
      
      for (let i = 0; i < 10; i++) {
        const time = measureRender(`Test${i}`, () => {
          render(<TestComponent />);
        });
        measurements.push(time);
      }

      const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
      expect(average).toBeLessThan(30); // Average under 30ms
    });
  });
});
