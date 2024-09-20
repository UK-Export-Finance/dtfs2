import { createMocks } from 'node-mocks-http';
import * as featureFlags from '../../helpers/is-feature-flag-enabled';
import { validateDealCancellationEnabled } from './deal-cancellation';

describe('validateDealCancellationEnabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when deal cancellation is enabled', () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, 'isTfmDealCancellationFeatureFlagEnabled').mockReturnValueOnce(true);
    });

    it('calls next', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validateDealCancellationEnabled(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('does not call res.redirect', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validateDealCancellationEnabled(req, res, next);

      expect(res._getRedirectUrl()).toEqual('');
    });
  });

  describe('when deal cancellation is disabled', () => {
    beforeEach(() => {
      jest.spyOn(featureFlags, 'isTfmDealCancellationFeatureFlagEnabled').mockReturnValueOnce(false);
    });

    it('does not call next when deal cancellation is enabled', () => {
      // Arrange

      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validateDealCancellationEnabled(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledTimes(0);
    });

    it('redirects to /not-found', () => {
      // Arrange
      const { req, res } = createMocks();
      const next = jest.fn();

      // Act
      validateDealCancellationEnabled(req, res, next);

      expect(res.statusCode).toEqual(404);
    });
  });
});
