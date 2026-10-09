import { PortalUser } from '@ukef/dtfs2-common';
import { doesUserHaveSignInTokens } from './does-user-have-sign-in-tokens';
import { aPortalUser } from '../../../test-helpers';

describe('doesUserHaveSignInTokens', () => {
  const user: PortalUser = aPortalUser();

  it('should return true if user has sign in tokens', () => {
    // Arrange
    const userWithTokens = {
      ...user,
      signInTokens: [
        {
          hashHex: 'someHash',
          saltHex: 'someSalt',
          expiry: 1234564565,
        },
      ],
    };

    // Act
    const result = doesUserHaveSignInTokens(userWithTokens);

    // Assert
    expect(result).toEqual(true);
  });

  it('should return false if user has no sign in tokens', () => {
    // Arrange
    const userWithoutTokens = {
      ...user,
      signInTokens: [],
    };

    // Act
    const result = doesUserHaveSignInTokens(userWithoutTokens);

    // Assert
    expect(result).toEqual(false);
  });

  it('should return false if user has undefined sign in tokens', () => {
    // Act
    const result = doesUserHaveSignInTokens(user);

    // Assert
    expect(result).toEqual(false);
  });
});
