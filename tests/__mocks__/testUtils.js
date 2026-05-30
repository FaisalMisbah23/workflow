/**
 * Test Utilities
 * Helper functions for writing consistent tests
 */

import { render } from '@testing-library/react-native';
import React from 'react';

// ============================================
// RENDER HELPERS
// ============================================

/**
 * Wrap component with required providers for testing
 */
export const renderWithProviders = (component, options = {}) => {
  const { providerProps = {}, ...renderOptions } = options;
  
  return render(component, {
    wrapper: ({ children }) => children,
    ...renderOptions,
  });
};

/**
 * Create a mock context provider wrapper
 */
export const createMockProvider = (Context, value) => {
  return ({ children }) => (
    React.createElement(Context.Provider, { value }, children)
  );
};

// ============================================
// ASYNC HELPERS
// ============================================

/**
 * Wait for a specified time
 */
export const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for promises to resolve
 */
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));

/**
 * Wait for component to update
 */
export const waitForUpdate = async (timeout = 100) => {
  await wait(timeout);
  await flushPromises();
};

// ============================================
// MOCK BUILDERS
// ============================================

/**
 * Build a mock Supabase query chain
 */
export const buildMockSupabaseChain = (finalResponse = { data: null, error: null }) => {
  const chain = {
    select: jest.fn(() => chain),
    insert: jest.fn(() => chain),
    update: jest.fn(() => chain),
    delete: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    neq: jest.fn(() => chain),
    gt: jest.fn(() => chain),
    lt: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    lte: jest.fn(() => chain),
    like: jest.fn(() => chain),
    ilike: jest.fn(() => chain),
    is: jest.fn(() => chain),
    in: jest.fn(() => chain),
    contains: jest.fn(() => chain),
    containedBy: jest.fn(() => chain),
    range: jest.fn(() => chain),
    overlaps: jest.fn(() => chain),
    textSearch: jest.fn(() => chain),
    match: jest.fn(() => chain),
    not: jest.fn(() => chain),
    or: jest.fn(() => chain),
    and: jest.fn(() => chain),
    filter: jest.fn(() => chain),
    order: jest.fn(() => chain),
    limit: jest.fn(() => chain),
    single: jest.fn(() => Promise.resolve(finalResponse)),
    maybeSingle: jest.fn(() => Promise.resolve(finalResponse)),
    csv: jest.fn(() => Promise.resolve(finalResponse)),
    then: jest.fn((callback) => Promise.resolve(callback(finalResponse))),
  };
  return chain;
};

/**
 * Build mock Supabase client with predefined responses
 */
export const buildMockSupabaseClient = (responses = {}) => {
  const defaultResponse = { data: null, error: null };
  
  return {
    auth: {
      signInWithPassword: jest.fn(() => Promise.resolve(responses.signIn || defaultResponse)),
      signUp: jest.fn(() => Promise.resolve(responses.signUp || defaultResponse)),
      signOut: jest.fn(() => Promise.resolve(responses.signOut || defaultResponse)),
      getUser: jest.fn(() => Promise.resolve(responses.getUser || { data: { user: null }, error: null })),
      getSession: jest.fn(() => Promise.resolve(responses.getSession || { data: { session: null }, error: null })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      resetPasswordForEmail: jest.fn(() => Promise.resolve(defaultResponse)),
      updateUser: jest.fn(() => Promise.resolve(defaultResponse)),
      admin: {
        getUserById: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    },
    from: jest.fn(() => buildMockSupabaseChain(responses.from || defaultResponse)),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve(responses.upload || { data: { path: 'test/path' }, error: null })),
        download: jest.fn(() => Promise.resolve(defaultResponse)),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } })),
        remove: jest.fn(() => Promise.resolve(defaultResponse)),
        list: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
    functions: {
      invoke: jest.fn(() => Promise.resolve(responses.invoke || defaultResponse)),
    },
    channel: jest.fn(() => ({
      on: jest.fn(function(event, filter, callback) {
        this.callback = callback;
        return this;
      }),
      subscribe: jest.fn(function() {
        return { unsubscribe: jest.fn() };
      }),
      // Helper to simulate receiving a message
      simulateMessage: jest.fn(function(payload) {
        if (this.callback) {
          this.callback(payload);
        }
      }),
    })),
    removeChannel: jest.fn(),
    removeAllChannels: jest.fn(),
  };
};

// ============================================
// EVENT SIMULATORS
// ============================================

/**
 * Simulate keyboard events
 */
export const simulateKeyboard = (element, key, options = {}) => {
  const event = {
    key,
    code: `Key${key.toUpperCase()}`,
    keyCode: key.charCodeAt(0),
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    ...options,
  };
  
  element.props.onKeyPress?.(event);
  return event;
};

/**
 * Simulate text input change
 */
export const simulateTextInput = (element, text) => {
  element.props.onChangeText?.(text);
};

/**
 * Simulate button press
 */
export const simulatePress = (element) => {
  element.props.onPress?.();
};

// ============================================
// ASSERTION HELPERS
// ============================================

/**
 * Assert that a function was called with specific arguments
 */
export const expectCalledWith = (mockFn, ...args) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

/**
 * Assert that a function was not called
 */
export const expectNotCalled = (mockFn) => {
  expect(mockFn).not.toHaveBeenCalled();
};

/**
 * Assert that a function was called exactly N times
 */
export const expectCalledTimes = (mockFn, times) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

/**
 * Assert that a mock Supabase chain was called in order
 */
export const expectSupabaseChain = (mockFrom, expectedChain) => {
  let current = mockFrom;
  
  for (const { method, args = [] } of expectedChain) {
    expect(current[method]).toHaveBeenCalledWith(...args);
    current = current[method].mock.results[0]?.value || current;
  }
};

// ============================================
// TEST DATA GENERATORS
// ============================================

/**
 * Generate unique IDs for tests
 */
export const generateId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Generate test dates
 */
export const generateDate = (daysFromNow = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

/**
 * Generate past date
 */
export const generatePastDate = (daysAgo = 1) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

/**
 * Generate future date
 */
export const generateFutureDate = (daysFromNow = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString();
};

// ============================================
// ERROR SIMULATORS
// ============================================

/**
 * Create a standard error object
 */
export const createError = (message = 'Test error', code = 'TEST_ERROR') => ({
  message,
  code,
  details: null,
  hint: null,
});

/**
 * Create a network error
 */
export const createNetworkError = (message = 'Network error') => ({
  message,
  code: 'NETWORK_ERROR',
  details: 'Failed to connect',
  hint: 'Check your internet connection',
});

/**
 * Create an auth error
 */
export const createAuthError = (message = 'Authentication failed') => ({
  message,
  code: 'AUTH_ERROR',
  details: 'Invalid credentials',
  hint: 'Check your email and password',
});

// ============================================
// LOCAL STORAGE MOCK
// ============================================

/**
 * Mock AsyncStorage with initial data
 */
export const mockAsyncStorage = (initialData = {}) => {
  const storage = { ...initialData };
  
  return {
    setItem: jest.fn((key, value) => {
      storage[key] = value;
      return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
      return Promise.resolve(storage[key] || null);
    }),
    removeItem: jest.fn((key) => {
      delete storage[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
    multiGet: jest.fn((keys) => Promise.resolve(keys.map(key => [key, storage[key]]))),
    multiSet: jest.fn((keyValues) => {
      keyValues.forEach(([key, value]) => {
        storage[key] = value;
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys) => {
      keys.forEach(key => delete storage[key]);
      return Promise.resolve();
    }),
    _storage: storage, // Expose for inspection
  };
};

// ============================================
// CONSOLE UTILITIES
// ============================================

/**
 * Suppress console methods during tests
 */
export const suppressConsole = (methods = ['log', 'warn', 'error']) => {
  const originals = {};
  
  beforeAll(() => {
    methods.forEach(method => {
      originals[method] = console[method];
      console[method] = jest.fn();
    });
  });
  
  afterAll(() => {
    methods.forEach(method => {
      console[method] = originals[method];
    });
  });
  
  return originals;
};

/**
 * Capture console output for assertions
 */
export const captureConsole = (method = 'log') => {
  const calls = [];
  const original = console[method];
  
  beforeEach(() => {
    console[method] = jest.fn((...args) => {
      calls.push(args);
    });
  });
  
  afterEach(() => {
    console[method] = original;
    calls.length = 0;
  });
  
  return {
    getCalls: () => calls,
    wasCalled: () => calls.length > 0,
    wasCalledWith: (...args) => calls.some(call => 
      JSON.stringify(call) === JSON.stringify(args)
    ),
  };
};
