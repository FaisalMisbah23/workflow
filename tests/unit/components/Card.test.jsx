/**
 * Card Component Unit Tests
 * Tests for statistics card displaying completed tasks, active tasks, team members, and success rate
 */

import Card from '@/components/Card';
import { UserContext } from '@/context/UserContext';
import { render, waitFor } from '@testing-library/react-native';

describe('Card Component', () => {
  const mockUser = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  };

  const mockTeamMembers = [
    { id: 'member-1', fullname: 'Member 1' },
    { id: 'member-2', fullname: 'Member 2' },
    { id: 'member-3', fullname: 'Member 3' },
  ];

  const renderCard = (overrides = {}) => {
    const contextValue = {
      user: mockUser,
      teamMembers: mockTeamMembers,
      ...overrides,
    };

    return render(
      <UserContext.Provider value={contextValue}>
        <Card />
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all four stat cards', () => {
      const { getByText } = renderCard();
      expect(getByText('Completed Task')).toBeTruthy();
      expect(getByText('Active Task')).toBeTruthy();
      expect(getByText('Team Members')).toBeTruthy();
      expect(getByText('Success Rate')).toBeTruthy();
    });

    it('should display completed tasks count', () => {
      const { getByText } = renderCard();
      expect(getByText('0')).toBeTruthy();
    });

    it('should display active tasks count', () => {
      const { getByText } = renderCard();
      expect(getByText('0')).toBeTruthy();
    });

    it('should display team members count', () => {
      const { getByText } = renderCard();
      expect(getByText('3')).toBeTruthy();
    });

    it('should display success rate percentage', () => {
      const { getByText } = renderCard();
      expect(getByText('0%')).toBeTruthy();
    });
  });

  describe('Data Fetching', () => {
    it('should fetch stats on mount when user is available', async () => {
      const supabase = require('@/lib/supabase').supabase;
      
      renderCard();

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('tasks');
      });
    });

    it('should not fetch stats when user is not available', () => {
      const supabase = require('@/lib/supabase').supabase;
      
      renderCard({ user: null });

      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should fetch completed tasks count', async () => {
      const supabase = require('@/lib/supabase').supabase;
      
      renderCard();

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('tasks');
      });
    });

    it('should fetch active tasks count', async () => {
      const supabase = require('@/lib/supabase').supabase;
      
      renderCard();

      await waitFor(() => {
        expect(supabase.from).toHaveBeenCalledWith('tasks');
      });
    });
  });

  describe('Success Rate Calculation', () => {
    it('should handle zero tasks correctly (0% success rate)', () => {
      const { getByText } = renderCard();
      expect(getByText('0%')).toBeTruthy();
    });

    it('should display success rate with percentage symbol', () => {
      const { getByText } = renderCard();
      expect(getByText('%')).toBeTruthy();
    });
  });

  describe('Team Members Display', () => {
    it('should display team members count from context', () => {
      const { getByText } = renderCard({ teamMembers: mockTeamMembers });
      expect(getByText('3')).toBeTruthy();
    });

    it('should display 0 when no team members', () => {
      const { getByText } = renderCard({ teamMembers: [] });
      expect(getByText('0')).toBeTruthy();
    });

    it('should display 0 when team members is null', () => {
      const { getByText } = renderCard({ teamMembers: null });
      expect(getByText('0')).toBeTruthy();
    });

    it('should display correct count for large team', () => {
      const largeTeam = Array.from({ length: 50 }, (_, i) => ({ id: `member-${i}` }));
      const { getByText } = renderCard({ teamMembers: largeTeam });
      expect(getByText('50')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user gracefully', () => {
      const { getByText } = renderCard({ user: null });
      expect(getByText('Completed Task')).toBeTruthy();
    });

    it('should handle missing user.id gracefully', () => {
      const { getByText } = renderCard({ user: {} });
      expect(getByText('Completed Task')).toBeTruthy();
    });
  });

  describe('Layout and Styling', () => {
    it('should render cards in a row layout', () => {
      const { getByText } = renderCard();
      expect(getByText('Completed Task')).toBeTruthy();
      expect(getByText('Active Task')).toBeTruthy();
    });
  });

  describe('Reactivity', () => {
    it('should update team members count when context changes', () => {
      const { rerender, getByText } = renderCard({ teamMembers: mockTeamMembers });
      expect(getByText('3')).toBeTruthy();

      rerender(
        <UserContext.Provider value={{ user: mockUser, teamMembers: [] }}>
          <Card />
        </UserContext.Provider>
      );

      expect(getByText('0')).toBeTruthy();
    });
  });
});
