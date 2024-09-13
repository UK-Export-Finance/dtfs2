import { DEAL_SUBMISSION_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import { isDealCancellationEnabled } from './deal-cancellation-enabled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;
const nonPimUser = { teams: [TEAM_IDS.UNDERWRITERS] } as TfmSessionUser;

describe('dealCancellationEnabled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to true', () => {
    describe('when user is a PIM user', () => {
      it('should return false if the deal type is MIA', () => {
        const result = isDealCancellationEnabled(DEAL_SUBMISSION_TYPE.MIA, pimUser);

        expect(result).toEqual(false);
      });

      it('should return true if the deal type is MIN', () => {
        const result = isDealCancellationEnabled(DEAL_SUBMISSION_TYPE.MIN, pimUser);

        expect(result).toEqual(true);
      });

      it('should return true if the deal type is AIN', () => {
        const result = isDealCancellationEnabled(DEAL_SUBMISSION_TYPE.AIN, pimUser);

        expect(result).toEqual(true);
      });
    });

    describe('when user is a non PIM user', () => {
      it.each([DEAL_SUBMISSION_TYPE.MIA, DEAL_SUBMISSION_TYPE.MIN, DEAL_SUBMISSION_TYPE.AIN])('should return false if the deal type is %s', (type) => {
        const result = isDealCancellationEnabled(type, nonPimUser);

        expect(result).toEqual(false);
      });
    });
  });
});
