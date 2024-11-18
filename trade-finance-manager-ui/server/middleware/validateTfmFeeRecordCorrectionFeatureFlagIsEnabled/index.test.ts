import httpMocks from 'node-mocks-http';
import * as ukefCommon from '@ukef/dtfs2-common';
import { validateTfmFeeRecordCorrectionFeatureFlagIsEnabled } from '.';

describe('validateTfmFeeRecordCorrectionFeatureFlagIsEnabled', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const isFeeRecordCorrectionFeatureFlagEnabledSpy = jest.spyOn(ukefCommon, 'isFeeRecordCorrectionFeatureFlagEnabled');

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("redirects to '/not-found' if the feature flag is not enabled", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    isFeeRecordCorrectionFeatureFlagEnabledSpy.mockReturnValue(false);

    // Act
    validateTfmFeeRecordCorrectionFeatureFlagIsEnabled(req, res, next);

    // Assert
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(next).not.toHaveBeenCalled();
  });

  it('calls the next function if the feature flag is enabled', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    isFeeRecordCorrectionFeatureFlagEnabledSpy.mockReturnValue(true);

    // Act
    validateTfmFeeRecordCorrectionFeatureFlagIsEnabled(req, res, next);

    // Assert
    expect(res._isEndCalled()).toEqual(false);
    expect(next).toHaveBeenCalled();
  });
});
