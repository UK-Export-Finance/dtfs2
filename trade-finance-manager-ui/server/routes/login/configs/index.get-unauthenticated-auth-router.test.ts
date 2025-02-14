import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { Router } from 'express';
import { getUnauthenticatedLoginRouter } from '.';
import { getUnauthenticatedLoginSsoRouter } from './unauthenticated-login-sso';

jest.mock('@ukef/dtfs2-common', () => ({
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

jest.mock('./unauthenticated-login-sso', () => ({
  getUnauthenticatedLoginSsoRouter: jest.fn(),
}));

describe('login router config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnauthenticatedLoginRouter', () => {
    describe('when isTfmSsoFeatureFlagEnabled is true', () => {
      beforeEach(() => {
        jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(true);
        jest.mocked(getUnauthenticatedLoginSsoRouter).mockReturnValue('unauthenticatedAuthSsoRouter' as unknown as Router);
      });

      it('should call getUnauthenticatedAuthSsoRouter', () => {
        getUnauthenticatedLoginRouter();

        expect(getUnauthenticatedLoginSsoRouter).toHaveBeenCalledTimes(1);
      });
      it('should return unauthenticatedAuthSsoRouter', () => {
        const result = getUnauthenticatedLoginRouter();
        expect(result).toEqual('unauthenticatedAuthSsoRouter');
      });
    });

    describe('when isTfmSsoFeatureFlagEnabled is false', () => {
      beforeEach(() => {
        jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(false);
      });

      it('should not call getUnauthenticatedAuthSsoRouter', () => {
        getUnauthenticatedLoginRouter();

        expect(getUnauthenticatedLoginSsoRouter).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        const result = getUnauthenticatedLoginRouter();
        expect(result).toBeUndefined();
      });
    });
  });
});
