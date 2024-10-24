import { DEAL_SUBMISSION_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import { canDealBeCancelled } from './can-deal-be-cancelled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;
const nonPimUser = { teams: [TEAM_IDS.UNDERWRITERS] } as TfmSessionUser;

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

describe('canDealBeCancelled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to true', () => {
    describe('when user is a PIM user', () => {
      it('should return false if the deal type is MIA', () => {
        const result = canDealBeCancelled(MIA, pimUser);

        expect(result).toEqual(false);
      });

      it('should return true if the deal type is MIN', () => {
        const result = canDealBeCancelled(MIN, pimUser);

        expect(result).toEqual(true);
      });

      it('should return true if the deal type is AIN', () => {
        const result = canDealBeCancelled(AIN, pimUser);

        expect(result).toEqual(true);
      });
    });

    describe('when user is not a PIM user', () => {
      it.each([MIA, MIN, AIN])('should return false if the deal type is %s', (type) => {
        const result = canDealBeCancelled(type, nonPimUser);

        expect(result).toEqual(false);
      });
    });
  });
});
