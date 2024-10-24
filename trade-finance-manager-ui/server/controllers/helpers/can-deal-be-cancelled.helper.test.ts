import { DEAL_SUBMISSION_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import { canSubmissionTypeBeCancelled, canDealBeCancelled } from './can-deal-be-cancelled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;
const nonPimUser = { teams: [TEAM_IDS.UNDERWRITERS] } as TfmSessionUser;

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

describe('canDealBeCancelled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to false', () => {
    describe('when user is a PIM user', () => {
      it.each([MIA, MIN, AIN])('should return false if the deal type is %s', (type) => {
        const result = canDealBeCancelled(type, pimUser);

        expect(result).toEqual(false);
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

describe('canSubmissionTypeBeCancelled', () => {
  it.each([AIN, MIN])('returns true when deal submission type is %s', (submissionType) => {
    const result = canSubmissionTypeBeCancelled(submissionType);

    expect(result).toEqual(true);
  });

  it(`returns false when deal submission type is ${MIA}`, () => {
    const result = canSubmissionTypeBeCancelled(MIA);

    expect(result).toEqual(false);
  });
});
