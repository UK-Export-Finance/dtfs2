import { RequestHandler } from 'express';
import { createMocks } from 'node-mocks-http';
import * as featureFlags from '../../helpers/is-feature-flag-enabled';
import { validateDealCancellationEnabled, validatePortalFacilityAmendmentsEnabled } from './validate-feature-flag-enabled';

describe('feature flag middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('validateDealCancellationEnabled', () => {
    withMiddlewareFeatureFlagTests('isTfmDealCancellationFeatureFlagEnabled', validateDealCancellationEnabled);
  });

  describe('validatePortalFacilityAmendmentsEnabled', () => {
    withMiddlewareFeatureFlagTests('isPortalFacilityAmendmentsFeatureFlagEnabled', validatePortalFacilityAmendmentsEnabled);
  });
});

function withMiddlewareFeatureFlagTests(featureFlagMethodName: keyof typeof featureFlags, middleware: RequestHandler) {
  describe(`when ${featureFlagMethodName} returns true`, () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, featureFlagMethodName).mockReturnValueOnce(true);
    });

    it('calls next', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('does not set the status to 404', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(res.statusCode).toEqual(200);
    });
  });

  describe(`when ${featureFlagMethodName} returns false`, () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, featureFlagMethodName).mockReturnValueOnce(false);
    });

    it('does not call next when deal cancellation is enabled', () => {
      // Arrange

      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('sets the status to 404', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      expect(res.statusCode).toEqual(404);
    });
  });
}
