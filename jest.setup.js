/**
 * Jest Setup File
 * Configuration and global mocks for React Native Testing
 */

// Note: We don't globally mock 'react-native-css-interop' here to avoid
// Babel/Jest transform conflicts. Individual tests can mock it if needed.

require('@testing-library/jest-native/extend-expect');

// ============================================
// GLOBAL MOCKS
// ============================================

// Mock React Native modules
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider',
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(() => Promise.resolve('base64data')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  copyAsync: jest.fn(() => Promise.resolve()),
  moveAsync: jest.fn(() => Promise.resolve()),
  EncodingType: {
    Base64: 'base64',
    UTF8: 'utf8',
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  launchCameraAsync: jest.fn(() => Promise.resolve({ canceled: true })),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children, testID, selectedValue, onValueChange, enabled }) =>
    React.createElement('Picker', { testID, selectedValue, onValueChange, enabled }, children);
  Picker.Item = ({ label, value }) => React.createElement('PickerItem', { value }, label);
  return { Picker };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn((callback) => {
    callback({ isConnected: true, isInternetReachable: true });
    return { remove: jest.fn() };
  }),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-push-token' })),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

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
    createNotification: jest.fn(async (data) => ({ success: true, data })),
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

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    navigate: jest.fn(),
    reload: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => []),
  Link: ({ children }) => children,
  Stack: {
    Screen: ({ children }) => children,
  },
  Tabs: {
    Screen: ({ children }) => children,
  },
}));

jest.mock('expo-constants', () => ({
  Constants: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-anon-key',
      },
    },
  },
}));

// Note: '@react-native-picker/picker' is mocked above with a component implementation.
// Avoid duplicate mocks here to prevent factory conflicts in Jest.

// ============================================
// SUPABASE MOCK
// ============================================

const createQueryBuilder = () => {
  const builder = {
    select: function() { return builder; },
    insert: function() { return builder; },
    update: function() { return builder; },
    delete: function() { return builder; },
    eq: function() { return builder; },
    neq: function() { return builder; },
    gt: function() { return builder; },
    lt: function() { return builder; },
    gte: function() { return builder; },
    lte: function() { return builder; },
    like: function() { return builder; },
    ilike: function() { return builder; },
    is: function() { return builder; },
    in: function() { return builder; },
    contains: function() { return builder; },
    containedBy: function() { return builder; },
    range: function() { return builder; },
    overlaps: function() { return builder; },
    textSearch: function() { return builder; },
    match: function() { return builder; },
    not: function() { return builder; },
    or: function() { return builder; },
    and: function() { return builder; },
    filter: function() { return builder; },
    order: function() { return builder; },
    limit: function() { return builder; },
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    csv: jest.fn(() => Promise.resolve({ data: null, error: null })),
    then: jest.fn((callback) => Promise.resolve(callback({ data: null, error: null }))),
  };
  return builder;
};

const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    admin: {
      getUserById: jest.fn(),
    },
  },
  from: jest.fn(() => createQueryBuilder()),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(() => Promise.resolve({ data: { path: 'test/path' }, error: null })),
      download: jest.fn(() => Promise.resolve({ data: null, error: null })),
      getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://test.com/image.jpg' } })),
      remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
      list: jest.fn(() => Promise.resolve({ data: [], error: null })),
    })),
  },
  functions: {
    invoke: jest.fn(() => Promise.resolve({ data: null, error: null })),
  },
  channel: jest.fn(() => ({
    on: jest.fn(function(event, filter, callback) {
      return this;
    }),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
  removeChannel: jest.fn(),
  removeAllChannels: jest.fn(),
};

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

// ============================================
// REACT NATIVE MODULES
// ============================================

jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Alert: {
      alert: jest.fn(),
    },
    ToastAndroid: {
      show: jest.fn(),
      SHORT: 0,
      LONG: 1,
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => style,
    },
    PixelRatio: {
      get: jest.fn(() => 2),
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    SafeAreaView: 'SafeAreaView',
    Modal: 'Modal',
    RefreshControl: 'RefreshControl',
    ActivityIndicator: 'ActivityIndicator',
    Image: 'Image',
    Pressable: 'Pressable',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    FlatList: 'FlatList',
    SectionList: 'SectionList',
    StatusBar: 'StatusBar',
  };
});

// ============================================
// GLOBAL TEST UTILITIES
// ============================================

global.waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

global.mockNavigation = () => ({
  navigate: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  reset: jest.fn(),
  dispatch: jest.fn(),
});

global.mockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestRoute',
  params,
});

// ============================================
// CONSOLE SUPPRESSION (Optional)
// ============================================

// Suppress console warnings during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Filter out specific React Native warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') ||
     args[0].includes('Animated') ||
     args[0].includes('NativeEventEmitter'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning:')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// ============================================
// TEST LIFECYCLE
// ============================================

beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});
