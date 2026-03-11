import { SIGN_IN_OTP_STATUS } from '@ukef/dtfs2-common';
import { signInTokenStatus } from './sign-in-token-status';
import { aPortalUser } from '../../../test-helpers';
import { verifyHash } from './verify-hash';

jest.mock('./verify-hash');
console.error = jest.fn();

describe('signInTokenStatus', () => {
  const user = aPortalUser();

  const mockVerifyHash = verifyHash as jest.Mock;

  describe('when user has no sign in tokens', () => {
    const userWithNoTokens = {
      ...user,
      signInTokens: undefined,
    };

    it(`should return ${SIGN_IN_OTP_STATUS.NOT_FOUND}`, () => {
      // Act
      const result = signInTokenStatus(userWithNoTokens, 'anySignInCode');

      // Assert
      expect(result).toEqual(SIGN_IN_OTP_STATUS.NOT_FOUND);
    });

    it('should call console.error with correct message', () => {
      // Act
      signInTokenStatus(userWithNoTokens, 'anySignInCode');

      // Assert
      expect(console.error).toHaveBeenCalledWith('No sign in tokens found for user %s', user._id);
    });
  });

  describe('when a user has an empty array of sign in tokens', () => {
    const userWithNoTokens = {
      ...user,
      signInTokens: [],
    };

    it(`should return ${SIGN_IN_OTP_STATUS.NOT_FOUND}`, () => {
      // Act
      const result = signInTokenStatus(userWithNoTokens, 'anySignInCode');

      // Assert
      expect(result).toEqual(SIGN_IN_OTP_STATUS.NOT_FOUND);
    });

    it('should call console.error with correct message', () => {
      // Act
      signInTokenStatus(userWithNoTokens, 'anySignInCode');

      // Assert
      expect(console.error).toHaveBeenCalledWith('No sign in tokens found for user %s', user._id);
    });
  });

  describe('when the user is missing hashHex, saltHex, or expiry in their latest sign in token', () => {
    const userWithNoTokens = {
      ...user,
      signInTokens: [{ hashHex: '', saltHex: '', expiry: 0 }],
    };

    it(`should return ${SIGN_IN_OTP_STATUS.NOT_FOUND} if user is missing hashHex, saltHex, or expiry`, () => {
      // Act
      const result = signInTokenStatus(userWithNoTokens, 'anySignInCode');

      // Assert
      expect(result).toEqual(SIGN_IN_OTP_STATUS.NOT_FOUND);
    });

    it('should call console.error with correct message', () => {
      // Act
      signInTokenStatus(userWithNoTokens, 'anySignInCode');

      // Assert
      expect(console.error).toHaveBeenCalledWith('Latest sign in token is missing required fields for user %s', user._id);
    });
  });

  describe('when verifyHash returns false', () => {
    const userWithTokens = {
      ...user,
      signInTokens: [{ hashHex: 'someHash', saltHex: 'someSalt', expiry: Date.now() + 10000 }],
    };

    beforeEach(() => {
      mockVerifyHash.mockReturnValue(false);
    });

    it(`should return ${SIGN_IN_OTP_STATUS.INVALID} if verifyHash returns false`, () => {
      // Act
      const result = signInTokenStatus(userWithTokens, 'anySignInCode');

      // Assert
      expect(result).toEqual(SIGN_IN_OTP_STATUS.INVALID);
    });

    it('should call console.error with correct message', () => {
      // Act
      signInTokenStatus(userWithTokens, 'anySignInCode');

      // Assert
      expect(console.error).toHaveBeenCalledWith('Sign in OTP is invalid for user %s', user._id);
    });
  });

  describe('when verifyHash returns true but the token is expired', () => {
    const userWithTokens = {
      ...user,
      signInTokens: [{ hashHex: 'someHash', saltHex: 'someSalt', expiry: Date.now() - 10000 }],
    };

    beforeEach(() => {
      mockVerifyHash.mockReturnValue(true);
    });

    it(`should return ${SIGN_IN_OTP_STATUS.EXPIRED} if token is expired`, () => {
      // Act
      const result = signInTokenStatus(userWithTokens, 'anySignInCode');

      // Assert
      expect(result).toEqual(SIGN_IN_OTP_STATUS.EXPIRED);
    });

    it('should call console.error with correct message', () => {
      // Act
      signInTokenStatus(userWithTokens, 'anySignInCode');

      // Assert
      expect(console.error).toHaveBeenCalledWith('Sign in OTP is expired for user %s', user._id);
    });
  });

  describe('when verifyHash returns true and the token is in date', () => {
    const userWithTokens = {
      ...user,
      signInTokens: [{ hashHex: 'someHash', saltHex: 'someSalt', expiry: Date.now() + 10000 }],
    };

    beforeEach(() => {
      mockVerifyHash.mockReturnValue(true);
    });

    it(`should return ${SIGN_IN_OTP_STATUS.VALID} if token is valid`, () => {
      // Act
      const result = signInTokenStatus(userWithTokens, 'anySignInCode');

      // Assert
      expect(result).toEqual(SIGN_IN_OTP_STATUS.VALID);
    });
  });
});
