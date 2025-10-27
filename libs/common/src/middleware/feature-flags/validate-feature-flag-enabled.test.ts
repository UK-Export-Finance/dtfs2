import { RequestHandler } from 'express';
import { createMocks } from 'node-mocks-http';
import * as featureFlags from '../../helpers/is-feature-flag-enabled';
import {
  validateDealCancellationEnabled,
  validateFeeRecordCorrectionFeatureFlagIsEnabled,
  validatePortalFacilityAmendmentsEnabled,
  validatePortal2FAFeatureFlagIsEnabled,
} from './validate-feature-flag-enabled';

describe('feature flag middleware', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('validateDealCancellationEnabled', () => {
    withBackendMiddlewareFeatureFlagTests('isTfmDealCancellationFeatureFlagEnabled', validateDealCancellationEnabled);
  });

  describe('validatePortalFacilityAmendmentsEnabled', () => {
    withBackendMiddlewareFeatureFlagTests('isPortalFacilityAmendmentsFeatureFlagEnabled', validatePortalFacilityAmendmentsEnabled);
  });

  describe('validateFeeRecordCorrectionFeatureFlagIsEnabled', () => {
    withFrontendMiddlewareFeatureFlagTests('isFeeRecordCorrectionFeatureFlagEnabled', validateFeeRecordCorrectionFeatureFlagIsEnabled);
  });

  describe('validatePortal2FAFeatureFlagIsEnabled', () => {
    withFrontendMiddlewareFeatureFlagTests('isPortal2FAFeatureFlagEnabled', validatePortal2FAFeatureFlagIsEnabled);
  });
});

function withBackendMiddlewareFeatureFlagTests(featureFlagMethodName: keyof typeof featureFlags, middleware: RequestHandler) {
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

function withFrontendMiddlewareFeatureFlagTests(featureFlagMethodName: keyof typeof featureFlags, middleware: RequestHandler) {
  describe(`when ${featureFlagMethodName} returns true`, () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, featureFlagMethodName).mockReturnValueOnce(true);
    });

    it('should call next', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should not redirect to "/not-found"', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).not.toEqual('/not-found');
    });
  });

  describe(`when ${featureFlagMethodName} returns false`, () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, featureFlagMethodName).mockReturnValueOnce(false);
    });

    it('should not call next', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('should redirect to "/not-found"', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      middleware(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
  });
}
