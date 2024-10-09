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
    it('should return unauthenticatedAuthSsoRouter if isTfmSsoFeatureFlagEnabled is true', () => {
      jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(true);
      jest.mocked(getUnauthenticatedAuthSsoRouter).mockReturnValue('unauthenticatedAuthSsoRouter' as unknown as Router);

      expect(getUnauthenticatedAuthRouter()).toBe('unauthenticatedAuthSsoRouter');
      expect(getUnauthenticatedAuthSsoRouter).toHaveBeenCalledTimes(1);
    });

    it('should return undefined if isTfmSsoFeatureFlagEnabled is false', () => {
      jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(false);

      expect(getUnauthenticatedAuthRouter()).toBe(undefined);
      expect(getUnauthenticatedAuthSsoRouter).not.toHaveBeenCalled();
    });
  });
});
