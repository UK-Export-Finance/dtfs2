import { DEAL_SUBMISSION_TYPE, isTfmDealCancellationFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { dealCancellationEnabled } from './deal-cancellation-enabled';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmDealCancellationFeatureFlagEnabled: jest.fn(),
}));

describe('dealCancellationEnabled', () => {
  describe('when TFM Deal Cancellation feature flag enabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmDealCancellationFeatureFlagEnabled).mockReturnValue(true);
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

  describe('when TFM Deal Cancellation feature flag disabled', () => {
    beforeEach(() => {
      jest.mocked(isTfmDealCancellationFeatureFlagEnabled).mockReturnValue(false);
    });

    it('should return false if the deal type is MIA', () => {
      const result = dealCancellationEnabled(DEAL_SUBMISSION_TYPE.MIA);

      expect(result).toEqual(false);
    });

    it('should return false if the deal type is MIN', () => {
      const result = dealCancellationEnabled(DEAL_SUBMISSION_TYPE.MIN);

      expect(result).toEqual(false);
    });

    it('should return false if the deal type is AIN', () => {
      const result = dealCancellationEnabled(DEAL_SUBMISSION_TYPE.AIN);

      expect(result).toEqual(false);
    });
  });
});
