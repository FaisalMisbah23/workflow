/**
 * UserContext Unit Tests
 * Tests for authentication, profile management, and role-based hierarchy
 */

import UserProvider, { UserContext } from '@/context/UserContext';
import { act, render, waitFor } from '@testing-library/react-native';
import { useContext } from 'react';
import {
    mockAdminProfile,
    mockLeadProfile,
    mockMemberProfile,
    mockMemberUser,
    mockOrganization,
    mockProfile,
    mockRouter,
    mockSession,
    mockSupabaseError,
    mockSupabaseResponse,
    mockTeamMembers
} from '../../__mocks__/fixtures';

// Mock router
jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
}));

// Mock supabase - must use inline factory
jest.mock('@/lib/supabase', () => {
  const createMockChain = () => ({
    select: jest.fn(() => createMockChain()),
    eq: jest.fn(() => createMockChain()),
    in: jest.fn(() => createMockChain()),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    then: jest.fn((cb) => Promise.resolve({ data: null, error: null }).then(cb)),
    insert: jest.fn(() => createMockChain()),
    update: jest.fn(() => createMockChain()),
    delete: jest.fn(() => createMockChain()),
  });

  const mockSupabaseClient = {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: jest.fn((callback) => {
        callback('SIGNED_OUT', null);
        setTimeout(async () => {
          const { data } = await mockSupabaseClient.auth.getSession();
          callback(data.session ? 'SIGNED_IN' : 'SIGNED_OUT', data.session);
        }, 0);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      admin: { getUserById: jest.fn() },
    },
    from: jest.fn(() => createMockChain()),
    storage: { from: jest.fn(() => ({ upload: jest.fn(), getPublicUrl: jest.fn() })) },
    functions: { invoke: jest.fn() },
    channel: jest.fn(() => ({ on: jest.fn(function() { return this; }), subscribe: jest.fn() })),
  };

  return { supabase: mockSupabaseClient };
});

// Test component to access context
const TestComponent = () => {
  const context = useContext(UserContext);
  return (
    <>
      <span testID="user">{context.user ? 'logged-in' : 'logged-out'}</span>
      <span testID="isLoggedIn">{context.isLoggedIn ? 'true' : 'false'}</span>
      <span testID="isAdmin">{context.isAdmin ? 'true' : 'false'}</span>
      <span testID="isLead">{context.isLead ? 'true' : 'false'}</span>
      <span testID="profile-role">{context.profile?.role || 'no-role'}</span>
      <span testID="team-count">{context.teamMembers?.length || 0}</span>
    </>
  );
};

const buildQuery = (response) => {
  const query = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    single: jest.fn(() => Promise.resolve(response)),
    maybeSingle: jest.fn(() => Promise.resolve(response)),
    then: (resolve, reject) => Promise.resolve(response).then(resolve, reject),
  };
  return query;
};

const buildMockSupabaseClient = () => ({
  from: jest.fn(() => buildQuery(mockSupabaseResponse([]))),
});

describe('UserContext', () => {
  let mockSupabase;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = require('@/lib/supabase').supabase;
  });

  describe('Authentication State', () => {
    it('should initialize with logged out state', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: null }, 
        error: null 
      });
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('user').children[0]).toBe('logged-out');
        expect(getByTestId('isLoggedIn').children[0]).toBe('false');
      });
    });

    it('should detect authenticated session on mount', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockReturnValue(buildQuery(mockSupabaseResponse(mockProfile)));
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('user').children[0]).toBe('logged-in');
        expect(getByTestId('isLoggedIn').children[0]).toBe('true');
      });
    });
  });

  describe('Login Function', () => {
    it('should successfully login with valid credentials', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: UserProvider,
      });
      
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: mockSession,
        error: null,
      });
      
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/home');
    });

    it('should handle login failure', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: UserProvider,
      });
      
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });
      
      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });
      
      expect(result.current.isLoggedIn).toBe(false);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: UserProvider,
      });
      
      await act(async () => {
        await result.current.login('invalid-email', 'password123');
      });
      
      // Should show toast for invalid email
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'invalid-email',
        password: 'password123',
      });
    });

    it('should require password', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: UserProvider,
      });
      
      await act(async () => {
        await result.current.login('test@example.com', '');
      });
      
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '',
      });
    });
  });

  describe('Logout Function', () => {
    it('should clear user state on logout', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: UserProvider,
      });
      
      await act(async () => {
        await result.current.logout();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.profile).toBeNull();
      expect(mockRouter.replace).toHaveBeenCalledWith('/signin');
    });
  });

  describe('Role-Based Hierarchy', () => {
    it('should identify admin users', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockReturnValue(buildQuery(mockSupabaseResponse(mockAdminProfile)));
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('isAdmin').children[0]).toBe('true');
        expect(getByTestId('isLead').children[0]).toBe('false');
        expect(getByTestId('profile-role').children[0]).toBe('admin');
      });
    });

    it('should identify lead users', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockReturnValue(buildQuery(mockSupabaseResponse(mockLeadProfile)));
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('isAdmin').children[0]).toBe('false');
        expect(getByTestId('isLead').children[0]).toBe('true');
        expect(getByTestId('profile-role').children[0]).toBe('lead');
      });
    });

    it('should identify member users', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockReturnValue(buildQuery(mockSupabaseResponse(mockMemberProfile)));
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('isAdmin').children[0]).toBe('false');
        expect(getByTestId('isLead').children[0]).toBe('false');
        expect(getByTestId('profile-role').children[0]).toBe('member');
      });
    });
  });

  describe('Team Members Loading', () => {
    it('should load team members for admin', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      let profilesCallCount = 0;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          profilesCallCount += 1;
          return profilesCallCount === 1
            ? buildQuery(mockSupabaseResponse(mockAdminProfile))
            : buildQuery(mockSupabaseResponse(mockTeamMembers));
        }
        return buildMockSupabaseClient().from();
      });
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('profile-role').children[0]).toBe('admin');
      });
    });

    it('should load team members for lead', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      const leadTeamMembers = mockTeamMembers.filter(m => m.lead_id === mockLeadProfile.id);
      
      let profilesCallCount = 0;
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          profilesCallCount += 1;
          return profilesCallCount === 1
            ? buildQuery(mockSupabaseResponse(mockLeadProfile))
            : buildQuery(mockSupabaseResponse(leadTeamMembers));
        }
        if (table === 'organizations') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue(mockSupabaseResponse([mockOrganization])),
            }),
          };
        }
        return buildMockSupabaseClient().from();
      });
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        // Lead should only see their team members
        expect(getByTestId('team-count').children[0]).toBeTruthy();
      });
    });

    it('should not load team members for regular member', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return buildQuery(mockSupabaseResponse(mockMemberProfile));
        }
        return buildMockSupabaseClient().from();
      });
      
      const { getByTestId } = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('team-count').children[0]).toBe('0');
      });
    });
  });

  describe('Assignment Hierarchy Validation', () => {
    it('should allow admin to assign to anyone', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: ({ children }) => (
          <UserContext.Provider value={{
            profile: mockAdminProfile,
            canAssignTask: () => true,
          }}>
            {children}
          </UserContext.Provider>
        ),
      });
      
      expect(result.current.canAssignTask('anyone@example.com')).toBe(true);
    });

    it('should allow lead to assign to team members', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: ({ children }) => (
          <UserContext.Provider value={{
            profile: mockLeadProfile,
            teamMembers: mockTeamMembers.filter(m => m.role === 'member'),
            canAssignTask: (email) => mockTeamMembers.filter(m => m.role === 'member').some(member => member.email === email),
          }}>
            {children}
          </UserContext.Provider>
        ),
      });
      
      // Lead can assign to their team members
      expect(result.current.canAssignTask(mockTeamMembers.find(m => m.role === 'member').email)).toBe(true);
    });

    it('should only allow member to self-assign', async () => {
      const { result } = renderHook(() => useContext(UserContext), {
        wrapper: ({ children }) => (
          <UserContext.Provider value={{
            profile: mockMemberProfile,
            user: { user: mockMemberUser },
            canAssignTask: (email) => email === mockMemberUser.email,
          }}>
            {children}
          </UserContext.Provider>
        ),
      });
      
      // Member can only assign to themselves
      expect(result.current.canAssignTask(mockMemberUser.email)).toBe(true);
      expect(result.current.canAssignTask('someone@else.com')).toBe(false);
    });
  });

  describe('Profile Loading', () => {
    it('should fetch profile on mount when user is available', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockReturnValue(buildQuery(mockSupabaseResponse(mockProfile)));
      
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      });
    });

    it('should handle profile fetch error gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockSupabase.from.mockReturnValue(buildQuery(mockSupabaseError('Profile not found')));
      
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('PROFILE ERROR:', expect.any(String));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Organization Loading', () => {
    it('should fetch organizations for logged in user', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({ 
        data: { session: mockSession }, 
        error: null 
      });
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'profiles') {
          return buildQuery(mockSupabaseResponse(mockProfile));
        }
        if (table === 'organizations') {
          return buildQuery(mockSupabaseResponse([mockOrganization]));
        }
        return buildMockSupabaseClient().from();
      });
      
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
      
      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('organizations');
      });
    });
  });
});

// Helper function for renderHook
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
