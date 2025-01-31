import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Router } from 'express';
import { getAuthRouter } from '.';
import { getAuthSsoRouter } from './auth-sso';

jest.mock('@ukef/dtfs2-common', () => ({
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

jest.mock('./authSso', () => ({
  getAuthSsoRouter: jest.fn(),
}));

describe('auth router config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthRouter', () => {
    it('should return authSsoRouter if isTfmSsoFeatureFlagEnabled is true', () => {
      jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(true);
      jest.mocked(getAuthSsoRouter).mockReturnValue('authSsoRouter' as unknown as Router);

      expect(getAuthRouter()).toBe('authSsoRouter');
      expect(getAuthSsoRouter).toHaveBeenCalledTimes(1);
    });

    it('should return undefined if isTfmSsoFeatureFlagEnabled is false', () => {
      jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(false);

      expect(getAuthRouter()).toBe(undefined);
      expect(getAuthSsoRouter).not.toHaveBeenCalled();
    });
  });
});
