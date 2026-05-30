/**
 * Profile Component Unit Tests
 * Tests for profile display, editing, avatar upload, and achievements
 */

import Profile from '@/app/(tabs)/profile';
import { UserContext } from '@/context/UserContext';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('@/components/Card', () => 'Card');
jest.mock('@/components/Settings', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return () => React.createElement(Text, null, 'Settings');
});
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  launchImageLibraryAsync: jest.fn(() => Promise.resolve({ canceled: true })),
}));

describe('Profile Component', () => {
  const mockUser = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
    },
  };

  const mockProfile = {
    id: 'test-user-id',
    fullname: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'member',
    org_id: 'test-org-id',
  };

  const mockOrg = [{ id: 'test-org-id', name: 'Test Organization' }];

  const mockUploadImage = jest.fn(() => Promise.resolve('https://example.com/new-avatar.jpg'));

  const renderProfile = (overrides = {}) => {
    const contextValue = {
      user: mockUser,
      isLoggedIn: true,
      profile: mockProfile,
      Org: mockOrg,
      uploadImage: mockUploadImage,
      setProfile: jest.fn(),
      ...overrides,
    };

    return render(
      <UserContext.Provider value={contextValue}>
        <Profile />
      </UserContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render profile information', () => {
      const { getByText } = renderProfile();
      expect(getByText('Test User')).toBeTruthy();
      expect(getByText('member')).toBeTruthy();
      expect(getByText('Test Organization')).toBeTruthy();
    });

    it('should render Edit Profile button', () => {
      const { getByText } = renderProfile();
      expect(getByText('Edit Profile')).toBeTruthy();
    });

    // Achievements section removed from UI

    it('should render Settings component', () => {
      const { getByText } = renderProfile();
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  describe('Avatar Display', () => {
    it('should display initials when no avatar', () => {
      const { getByText } = renderProfile({
        profile: { ...mockProfile, avatar_url: null },
      });
      expect(getByText('TE')).toBeTruthy();
    });
  });

  describe('Edit Profile Mode', () => {
    it('should enter edit mode when Edit Profile button is pressed', () => {
      const { getByText, getByPlaceholderText } = renderProfile();
      const editButton = getByText('Edit Profile');
      fireEvent.press(editButton);

      expect(getByPlaceholderText('Full Name')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should cancel edit mode and revert changes', () => {
      const { getByText, getByPlaceholderText } = renderProfile();
      fireEvent.press(getByText('Edit Profile'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), 'Changed Name');
      fireEvent.press(getByText('Cancel'));

      // Should revert to original name
      expect(getByText('Test User')).toBeTruthy();
    });

    it('should show error when saving empty name', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');
      const { getByText, getByPlaceholderText } = renderProfile();

      fireEvent.press(getByText('Edit Profile'));
      fireEvent.changeText(getByPlaceholderText('Full Name'), '');
      fireEvent.press(getByText('Save'));

      expect(alertSpy).toHaveBeenCalledWith('Error', 'Full name cannot be empty');
      alertSpy.mockRestore();
    });
  });

  describe('Avatar Upload', () => {
    it('should handle camera icon press', () => {
      const { getByTestId } = renderProfile();
      const cameraIcon = getByTestId('camera-icon');
      fireEvent.press(cameraIcon);
      // Should not crash
    });
  });

  // Achievements tests removed

  describe('Edge Cases', () => {
    it('should handle missing profile gracefully', () => {
      const { getByText } = renderProfile({ profile: null });
      // Should not crash
      expect(getByText('Settings')).toBeTruthy();
    });

    it('should handle missing organization gracefully', () => {
      const { getByText } = renderProfile({ Org: [] });
      // Should not crash
      expect(getByText('Settings')).toBeTruthy();
    });

    it('should handle missing user gracefully', () => {
      const { getByText } = renderProfile({ user: null });
      // Should not crash
      expect(getByText('Settings')).toBeTruthy();
    });
  });

  describe('Integration with UserContext', () => {
    it('should use profile from UserContext', () => {
      const customProfile = { ...mockProfile, fullname: 'Custom Name' };
      const { getByText } = renderProfile({ profile: customProfile });
      expect(getByText('Custom Name')).toBeTruthy();
    });

    it('should use organization from UserContext', () => {
      const customOrg = [{ id: 'custom-org', name: 'Custom Org' }];
      const { getByText } = renderProfile({ Org: customOrg });
      expect(getByText('Custom Org')).toBeTruthy();
    });
  });
});
