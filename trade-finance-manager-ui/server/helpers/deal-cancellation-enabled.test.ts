import * as ukefCommon from '@ukef/dtfs2-common';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { dealCancellationEnabled } from './deal-cancellation-enabled';

describe('dealCancellationEnabled', () => {
  const isTfmDealCancellationFeatureFlagEnabledSpy = jest.spyOn(ukefCommon, 'isTfmDealCancellationFeatureFlagEnabled');

  describe('when TFM Deal Cancellation feature flag is enabled', () => {
    beforeEach(() => {
      isTfmDealCancellationFeatureFlagEnabledSpy.mockReturnValue(true);
    });

    it('should return false if the deal type is MIA', () => {
      const result = dealCancellationEnabled(DEAL_SUBMISSION_TYPE.MIA);

      expect(result).toEqual(false);
    });

    it('should return true if the deal type is MIN', () => {
      const result = dealCancellationEnabled(DEAL_SUBMISSION_TYPE.MIN);

      expect(result).toEqual(true);
    });

    it('should return true if the deal type is AIN', () => {
      const result = dealCancellationEnabled(DEAL_SUBMISSION_TYPE.AIN);

      expect(result).toEqual(true);
    });
  });

  describe('when TFM Deal Cancellation feature flag is disabled', () => {
    beforeEach(() => {
      isTfmDealCancellationFeatureFlagEnabledSpy.mockReturnValue(false);
    });

    it.each([DEAL_SUBMISSION_TYPE.MIA, DEAL_SUBMISSION_TYPE.MIN, DEAL_SUBMISSION_TYPE.AIN])('should return false if the deal type is %s', (type) => {
      const result = dealCancellationEnabled(type);

      expect(result).toEqual(false);
    });
  });
});
