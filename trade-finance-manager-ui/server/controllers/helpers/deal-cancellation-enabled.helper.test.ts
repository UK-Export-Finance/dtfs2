import { DEAL_SUBMISSION_TYPE, TEAM_IDS } from '@ukef/dtfs2-common';
import { canSubmissionTypeBeCancelled, isDealCancellationEnabled } from './deal-cancellation-enabled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;
const nonPimUser = { teams: [TEAM_IDS.UNDERWRITERS] } as TfmSessionUser;

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

describe('dealCancellationEnabled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to false', () => {
    describe('when user is a PIM user', () => {
      it.each([MIA, MIN, AIN])('should return false if the deal type is %s', (type) => {
        const result = isDealCancellationEnabled(type, pimUser);

        expect(result).toEqual(false);
      });
    });

    describe('when user is not a PIM user', () => {
      it.each([MIA, MIN, AIN])('should return false if the deal type is %s', (type) => {
        const result = isDealCancellationEnabled(type, nonPimUser);

        expect(result).toEqual(false);
      });
    });
  });
});

describe('canSubmissionTypeBeCancelled', () => {
  it('returns true when deal submission type is AIN', () => {
    const result = canSubmissionTypeBeCancelled(DEAL_SUBMISSION_TYPE.AIN);

    expect(result).toBe(true);
  });

  it('returns true when deal submission type is MIN', () => {
    const result = canSubmissionTypeBeCancelled(DEAL_SUBMISSION_TYPE.MIN);

    expect(result).toBe(true);
  });

  it('returns false when deal submission type is MIA', () => {
    const result = canSubmissionTypeBeCancelled(DEAL_SUBMISSION_TYPE.MIA);

    expect(result).toBe(false);
  });
});
