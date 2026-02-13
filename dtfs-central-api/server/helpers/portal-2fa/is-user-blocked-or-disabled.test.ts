import { isUserBlockedOrDisabled } from './is-user-blocked-or-disabled';
import { aPortalUser } from '../../../test-helpers';

describe('isUserBlockedOrDisabled', () => {
  const user = aPortalUser();

  it('should return true if user is blocked', () => {
    // Arrange
    const userIsBlocked = {
      ...user,
      'user-status': 'blocked',
      disabled: false,
    };

    // Act
    const result = isUserBlockedOrDisabled(userIsBlocked);

    // Assert
    expect(result).toEqual(true);
  });

  it('should return true if user is disabled', () => {
    // Arrange
    const userIsDisabled = {
      ...user,
      'user-status': 'active',
      disabled: true,
    };

    // Act
    const result = isUserBlockedOrDisabled(userIsDisabled);

    // Assert
    expect(result).toEqual(true);
  });

  it('should return false if user is active and not disabled', () => {
    // Arrange
    const userIsActive = {
      ...user,
      'user-status': 'active',
      disabled: false,
    };

    // Act
    const result = isUserBlockedOrDisabled(userIsActive);

    // Assert
    expect(result).toEqual(false);
  });
});
