import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { dealCancellationEnabled } from './deal-cancellation-enabled.helper';

describe('dealCancellationEnabled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to false', () => {
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
});
