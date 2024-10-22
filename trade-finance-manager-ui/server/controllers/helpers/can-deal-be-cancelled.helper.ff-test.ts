import { DEAL_SUBMISSION_TYPE, TEAM_IDS, TFM_DEAL_CANCELLATION_STATUS } from '@ukef/dtfs2-common';
import { canDealBeCancelled } from './can-deal-be-cancelled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;
const nonPimUser = { teams: [TEAM_IDS.UNDERWRITERS] } as TfmSessionUser;

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;
const { COMPLETED, SCHEDULED, DRAFT } = TFM_DEAL_CANCELLATION_STATUS;

describe('canDealBeCancelled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to true', () => {
    describe('when user is a PIM user', () => {
      describe.each([MIN, AIN])('when the deal type is %s', (type) => {
        it('should return false when the cancellation status is completed', () => {
          const result = canDealBeCancelled(type, pimUser, COMPLETED);

          expect(result).toEqual(false);
        });

        it('should return false when the cancellation status is scheduled', () => {
          const result = canDealBeCancelled(type, pimUser, SCHEDULED);

          expect(result).toEqual(false);
        });

        it('should return true when the cancellation status is draft', () => {
          const result = canDealBeCancelled(type, pimUser, DRAFT);

          expect(result).toEqual(true);
        });

        it('should return true if the cancellation status is undefined', () => {
          const result = canDealBeCancelled(type, pimUser, undefined);

          expect(result).toEqual(true);
        });
      });

      describe('when the deal type is is MIA', () => {
        it('should return false when the cancellation status is completed', () => {
          const result = canDealBeCancelled(MIA, pimUser, COMPLETED);

          expect(result).toEqual(false);
        });

        it('should return false when the cancellation status is scheduled', () => {
          const result = canDealBeCancelled(MIA, pimUser, SCHEDULED);

          expect(result).toEqual(false);
        });

        it('should return false when the cancellation status is draft', () => {
          const result = canDealBeCancelled(MIA, pimUser, DRAFT);

          expect(result).toEqual(false);
        });

        it('should return false if the cancellation status is undefined', () => {
          const result = canDealBeCancelled(MIA, pimUser, undefined);

          expect(result).toEqual(false);
        });
      });
    });

    describe('when user is not a PIM user', () => {
      describe.each([MIA, MIN, AIN])('when the deal type is %s', (type) => {
        it('should return false if the cancellation status is completed', () => {
          const result = canDealBeCancelled(type, nonPimUser, COMPLETED);
          expect(result).toEqual(false);
        });

        it('should return false if the cancellation status is scheduled', () => {
          const result = canDealBeCancelled(type, nonPimUser, SCHEDULED);
          expect(result).toEqual(false);
        });

        it('should return false if the cancellation status is draft', () => {
          const result = canDealBeCancelled(type, nonPimUser, DRAFT);
          expect(result).toEqual(false);
        });

        it('should return false if the cancellation status is undefined', () => {
          const result = canDealBeCancelled(type, nonPimUser, undefined);
          expect(result).toEqual(false);
        });
      });
    });
  });
});
