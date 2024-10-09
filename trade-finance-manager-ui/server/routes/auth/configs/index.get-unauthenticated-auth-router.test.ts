import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Router } from 'express';
import { getUnauthenticatedAuthRouter } from '.';
import { getUnauthenticatedAuthSsoRouter } from './unauthenticated-auth-sso';

jest.mock('@ukef/dtfs2-common', () => ({
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

jest.mock('./unauthenticatedAuthSso', () => ({
  getUnauthenticatedAuthSsoRouter: jest.fn(),
}));

describe('auth router config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnauthenticatedAuthRouter', () => {
    describe('when isTfmSsoFeatureFlagEnabled is true', () => {
      beforeEach(() => {
        jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(true);
        jest.mocked(getUnauthenticatedAuthSsoRouter).mockReturnValue('unauthenticatedAuthSsoRouter' as unknown as Router);
      });

      it('should call getUnauthenticatedAuthSsoRouter', () => {
        getUnauthenticatedAuthRouter();

        expect(getUnauthenticatedAuthSsoRouter).toHaveBeenCalledTimes(1);
      });
      it('should return unauthenticatedAuthSsoRouter', () => {
        const result = getUnauthenticatedAuthRouter();
        expect(result).toBe('unauthenticatedAuthSsoRouter');
      });
    });

    describe('when isTfmSsoFeatureFlagEnabled is false', () => {
      beforeEach(() => {
        jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(false);
      });

      it('should not call getUnauthenticatedAuthSsoRouter', () => {
        getUnauthenticatedAuthRouter();

        expect(getUnauthenticatedAuthSsoRouter).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        const result = getUnauthenticatedAuthRouter();
        expect(result).toBeUndefined();
      });
    });
  });
});
