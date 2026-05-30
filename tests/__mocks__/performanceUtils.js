/**
 * Performance Testing Utilities
 * Helper functions for measuring and tracking performance metrics
 */

// Performance metrics storage
const performanceMetrics = {
  renders: [],
  apiCalls: [],
  navigation: [],
  memory: [],
};

/**
 * Measure render time of a component
 * @param {string} componentName - Name of the component being measured
 * @param {Function} renderFn - Render function to measure
 * @returns {number} Render time in milliseconds
 */
export const measureRender = (componentName, renderFn) => {
  const startTime = performance.now();
  renderFn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  performanceMetrics.renders.push({
    component: componentName,
    duration,
    timestamp: Date.now(),
  });
  
  return duration;
};

/**
 * Measure API call performance
 * @param {string} apiName - Name of the API call
 * @param {Promise} apiCall - Promise representing the API call
 * @returns {Promise<number>} Duration in milliseconds
 */
export const measureAPICall = async (apiName, apiCall) => {
  const startTime = performance.now();
  try {
    await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.apiCalls.push({
      api: apiName,
      duration,
      success: true,
      timestamp: Date.now(),
    });
    
    return duration;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.apiCalls.push({
      api: apiName,
      duration,
      success: false,
      error: error.message,
      timestamp: Date.now(),
    });
    
    throw error;
  }
};

/**
 * Measure navigation transition time
 * @param {string} routeName - Name of the route
 * @param {Function} navigationFn - Navigation function
 * @returns {number} Duration in milliseconds
 */
export const measureNavigation = (routeName, navigationFn) => {
  const startTime = performance.now();
  navigationFn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  performanceMetrics.navigation.push({
    route: routeName,
    duration,
    timestamp: Date.now(),
  });
  
  return duration;
};

/**
 * Get performance statistics
 * @param {string} metricType - Type of metric ('renders', 'apiCalls', 'navigation')
 * @returns {Object} Statistics object
 */
export const getPerformanceStats = (metricType) => {
  const metrics = performanceMetrics[metricType];
  
  if (!metrics || metrics.length === 0) {
    return {
      count: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    };
  }
  
  const sorted = [...metrics].sort((a, b) => a.duration - b.duration);
  const durations = sorted.map(m => m.duration);
  
  const sum = durations.reduce((a, b) => a + b, 0);
  const average = sum / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  
  const p50Index = Math.floor(durations.length * 0.5);
  const p95Index = Math.floor(durations.length * 0.95);
  const p99Index = Math.floor(durations.length * 0.99);
  
  return {
    count: durations.length,
    average,
    min,
    max,
    p50: durations[p50Index],
    p95: durations[p95Index],
    p99: durations[p99Index],
  };
};

/**
 * Check if performance meets threshold
 * @param {number} actual - Actual performance value
 * @param {number} threshold - Threshold value
 * @param {string} metricName - Name of the metric
 * @returns {boolean} True if within threshold
 */
export const checkThreshold = (actual, threshold, metricName) => {
  const passes = actual <= threshold;
  
  if (!passes) {
    console.warn(
      `Performance Warning: ${metricName} (${actual}ms) exceeds threshold (${threshold}ms)`
    );
  }
  
  return passes;
};

/**
 * Clear performance metrics
 */
export const clearMetrics = () => {
  performanceMetrics.renders = [];
  performanceMetrics.apiCalls = [];
  performanceMetrics.navigation = [];
  performanceMetrics.memory = [];
};

/**
 * Get all performance metrics
 * @returns {Object} All collected metrics
 */
export const getAllMetrics = () => {
  return { ...performanceMetrics };
};

/**
 * Performance thresholds for different operations
 */
export const PERFORMANCE_THRESHOLDS = {
  // Component render thresholds (60fps = 16.67ms per frame)
  SIMPLE_RENDER: 16.67,
  COMPLEX_RENDER: 50,
  LIST_RENDER: 100,
  
  // API call thresholds
  FAST_API: 100,
  NORMAL_API: 500,
  SLOW_API: 2000,
  
  // Navigation thresholds
  FAST_NAVIGATION: 100,
  NORMAL_NAVIGATION: 300,
  
  // Memory thresholds (in MB)
  MEMORY_LIMIT: 100,
};

/**
 * Validate performance against thresholds
 * @param {string} metricType - Type of metric
 * @param {number} value - Performance value
 * @param {string} operation - Operation name
 * @returns {Object} Validation result
 */
export const validatePerformance = (metricType, value, operation) => {
  const thresholds = PERFORMANCE_THRESHOLDS;
  let threshold;
  let passes;
  
  switch (metricType) {
    case 'render':
      if (operation.includes('list')) {
        threshold = thresholds.LIST_RENDER;
      } else if (operation.includes('complex')) {
        threshold = thresholds.COMPLEX_RENDER;
      } else {
        threshold = thresholds.SIMPLE_RENDER;
      }
      break;
    case 'api':
      if (operation.includes('slow')) {
        threshold = thresholds.SLOW_API;
      } else if (operation.includes('normal')) {
        threshold = thresholds.NORMAL_API;
      } else {
        threshold = thresholds.FAST_API;
      }
      break;
    case 'navigation':
      threshold = thresholds.NORMAL_NAVIGATION;
      break;
    default:
      threshold = thresholds.SIMPLE_RENDER;
  }
  
  passes = value <= threshold;
  
  return {
    passes,
    threshold,
    value,
    message: passes
      ? `${operation} performs within threshold (${value}ms <= ${threshold}ms)`
      : `${operation} exceeds threshold (${value}ms > ${threshold}ms)`,
  };
};

/**
 * Generate performance report
 * @returns {Object} Performance report
 */
export const generatePerformanceReport = () => {
  const renderStats = getPerformanceStats('renders');
  const apiStats = getPerformanceStats('apiCalls');
  const navigationStats = getPerformanceStats('navigation');
  
  return {
    renders: renderStats,
    apiCalls: apiStats,
    navigation: navigationStats,
    summary: {
      totalMeasurements: 
        renderStats.count + apiStats.count + navigationStats.count,
      passedThresholds: 
        (renderStats.average <= PERFORMANCE_THRESHOLDS.COMPLEX_RENDER ? 1 : 0) +
        (apiStats.average <= PERFORMANCE_THRESHOLDS.NORMAL_API ? 1 : 0) +
        (navigationStats.average <= PERFORMANCE_THRESHOLDS.NORMAL_NAVIGATION ? 1 : 0),
    },
  };
};
