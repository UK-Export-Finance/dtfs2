import { createMocks } from 'node-mocks-http';
import * as featureFlags from '../../helpers/is-feature-flag-enabled';
import { validatePortalFacilityAmendmentsEnabled } from './portal-facility-amendments';

describe('validatePortalFacilityAmendmentsEnabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when portal facility amendments is enabled', () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValueOnce(true);
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

    it('does not set the status to 404', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortalFacilityAmendmentsEnabled(req, res, next);

      // Assert
      expect(res.statusCode).toEqual(200);
    });
  });

  describe('when portal facility amendments is disabled', () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValueOnce(false);
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

    it('sets the status to 404', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validatePortalFacilityAmendmentsEnabled(req, res, next);

      expect(res.statusCode).toEqual(404);
    });
  });
});
