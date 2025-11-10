import { createMocks } from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { validatePortal2FAEnabled } from './portal-2fa';

describe('validatePortal2FAEnabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when portal 2FA is enabled', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortal2FAFeatureFlagEnabled').mockReturnValueOnce(true);
    });

    it('calls next', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortal2FAEnabled(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('does not call res.redirect', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortal2FAEnabled(req, res, next);

      expect(res._getRedirectUrl()).toEqual('');
    });
  });

  describe('when portal 2fa is disabled', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortal2FAFeatureFlagEnabled').mockReturnValueOnce(false);
    });

    it('does not call next', () => {
      // Arrange

      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortal2FAEnabled(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('redirects to /not-found', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortal2FAEnabled(req, res, next);

      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
  });
});
