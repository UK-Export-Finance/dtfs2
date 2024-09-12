import { DEAL_SUBMISSION_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import { dealCancellationEnabled } from './deal-cancellation-enabled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;

describe('dealCancellationEnabled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to false', () => {
    it.each([DEAL_SUBMISSION_TYPE.MIA, DEAL_SUBMISSION_TYPE.MIN, DEAL_SUBMISSION_TYPE.AIN])('should return false if the deal type is %s', (type) => {
      const result = dealCancellationEnabled(type, pimUser);

      expect(result).toEqual(false);
    });
  });
});
