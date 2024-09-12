import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { dealCancellationEnabled } from './deal-cancellation-enabled';

describe('dealCancellationEnabled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to false', () => {
    it.each([DEAL_SUBMISSION_TYPE.MIA, DEAL_SUBMISSION_TYPE.MIN, DEAL_SUBMISSION_TYPE.AIN])('should return false if the deal type is %s', (type) => {
      const result = dealCancellationEnabled(type);

      expect(result).toEqual(false);
    });
  });
});
