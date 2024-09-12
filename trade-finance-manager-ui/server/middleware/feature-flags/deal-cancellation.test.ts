import { createMocks } from 'node-mocks-http';
import * as dtfsCommon from '@ukef/dtfs2-common';
import { validateDealCancellationEnabled } from './deal-cancellation';

describe('validateDealCancellationEnabled', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when deal cancellation is enabled', () => {
    beforeEach(() => {
      jest.spyOn(dtfsCommon, 'isTfmDealCancellationFeatureFlagEnabled').mockReturnValueOnce(true);
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
      jest.spyOn(dtfsCommon, 'isTfmDealCancellationFeatureFlagEnabled').mockReturnValueOnce(false);
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

      expect(res._getRedirectUrl()).toEqual('/not-found');
    });
  });
});
