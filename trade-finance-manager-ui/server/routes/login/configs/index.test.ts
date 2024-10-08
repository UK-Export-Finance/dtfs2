import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Router } from 'express';
import { getLoginRouter } from '.';
import { getLoginSsoRouter } from './login-sso';
import { getLoginNonSsoRouter } from './login-non-sso';

jest.mock('@ukef/dtfs2-common', () => ({
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

jest.mock('./login-sso', () => ({
  getLoginSsoRouter: jest.fn(),
}));

jest.mock('./login-non-sso', () => ({
  getLoginNonSsoRouter: jest.fn(),
}));

describe('login router config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLoginRouter', () => {
    it('should return loginSsoRouter if isTfmSsoFeatureFlagEnabled is true', () => {
      jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(true);
      jest.mocked(getLoginSsoRouter).mockReturnValue('loginSsoRouter' as unknown as Router);

      expect(getLoginRouter()).toEqual('loginSsoRouter');
      expect(getLoginSsoRouter).toHaveBeenCalledTimes(1);
      expect(getLoginNonSsoRouter).not.toHaveBeenCalled();
    });

    it('should return loginNonSsoRouter if isTfmSsoFeatureFlagEnabled is false', () => {
      jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(false);
      jest.mocked(getLoginNonSsoRouter).mockReturnValue('loginNonSsoRouter' as unknown as Router);

      expect(getLoginRouter()).toEqual('loginNonSsoRouter');
      expect(getLoginNonSsoRouter).toHaveBeenCalledTimes(1);
      expect(getLoginSsoRouter).not.toHaveBeenCalled();
    });
  });
});
