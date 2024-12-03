import { createMocks } from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { validatePortalFacilityAmendmentsEnabled } from './portal-facility-amendments';

describe('validatePortalFacilityAmendmentsEnabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when portal facility amendments is enabled', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValueOnce(true);
    });

    it('calls next', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortalFacilityAmendmentsEnabled(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('does not call res.redirect', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortalFacilityAmendmentsEnabled(req, res, next);

      expect(res._getRedirectUrl()).toEqual('');
    });
  });

  describe('when portal facility amendments is disabled', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValueOnce(false);
    });

    it('does not call next', () => {
      // Arrange

      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortalFacilityAmendmentsEnabled(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('redirects to /not-found', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortalFacilityAmendmentsEnabled(req, res, next);

      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
  });
});
