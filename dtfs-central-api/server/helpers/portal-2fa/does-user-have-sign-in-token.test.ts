import { PortalUser } from '@ukef/dtfs2-common';
import { doesUserHaveSignInTokens } from './does-user-have-sign-in-tokens';
import { aPortalUser } from '../../../test-helpers';

describe('doesUserHaveSignInTokens', () => {
  const user: PortalUser = aPortalUser();

  it('should return true if user has sign in tokens', () => {
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

    expect(doesUserHaveSignInTokens(userWithTokens)).toEqual(true);
  });

  it('should return false if user has no sign in tokens', () => {
    const userWithoutTokens = {
      ...user,
      signInTokens: [],
    };

    expect(doesUserHaveSignInTokens(userWithoutTokens)).toEqual(false);
  });

  it('should return false if user has undefined sign in tokens', () => {
    expect(doesUserHaveSignInTokens(user)).toEqual(false);
  });
});
