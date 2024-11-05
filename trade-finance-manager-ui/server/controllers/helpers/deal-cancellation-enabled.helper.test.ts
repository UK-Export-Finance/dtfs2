import { DEAL_SUBMISSION_TYPE, TEAM_IDS, TFM_DEAL_CANCELLATION_STATUS } from '@ukef/dtfs2-common';
import {
  canDealBeCancelled,
  canSubmissionTypeBeCancelled,
  isDealCancellationEnabledForUser,
  isDealCancellationInDraft,
} from './deal-cancellation-enabled.helper';
import { TfmSessionUser } from '../../types/tfm-session-user';

const pimUser = { teams: [TEAM_IDS.PIM] } as TfmSessionUser;
const nonPimUser = { teams: [TEAM_IDS.UNDERWRITERS] } as TfmSessionUser;

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;
const { COMPLETED, SCHEDULED, DRAFT } = TFM_DEAL_CANCELLATION_STATUS;

describe('dealCancellationEnabled', () => {
  describe('when `FF_TFM_FACILITY_END_DATE_ENABLED` is set to false', () => {
    describe('when user is a PIM user', () => {
      it.each([MIA, MIN, AIN])('should return false if the deal type is %s', (type) => {
        const result = isDealCancellationEnabledForUser(type, pimUser);

        expect(result).toEqual(false);
      });
    });

    describe('when user is not a PIM user', () => {
      it.each([MIA, MIN, AIN])('should return false if the deal type is %s', (type) => {
        const result = isDealCancellationEnabledForUser(type, nonPimUser);

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

describe('canDealStillBeCancelled', () => {
  it(`returns false when the cancellation status is ${COMPLETED}`, () => {
    const result = canDealBeCancelled(COMPLETED);

    expect(result).toEqual(false);
  });

  it(`returns false when the cancellation status is ${SCHEDULED}`, () => {
    const result = canDealBeCancelled(SCHEDULED);

    expect(result).toEqual(false);
  });

  it(`returns true when the cancellation status is ${DRAFT}`, () => {
    const result = canDealBeCancelled(DRAFT);

    expect(result).toEqual(true);
  });

  it(`returns true when the cancellation status is undefined`, () => {
    const result = canDealBeCancelled();

    expect(result).toEqual(true);
  });
});

describe('isDealCancellationInDraft', () => {
  it(`returns false when the cancellation status is ${COMPLETED}`, () => {
    const result = isDealCancellationInDraft(COMPLETED);

    expect(result).toEqual(false);
  });

  it(`returns false when the cancellation status is ${SCHEDULED}`, () => {
    const result = isDealCancellationInDraft(SCHEDULED);

    expect(result).toEqual(false);
  });

  it(`returns true when the cancellation status is ${DRAFT}`, () => {
    const result = isDealCancellationInDraft(DRAFT);

    expect(result).toEqual(true);
  });

  it(`returns false when the cancellation status is undefined`, () => {
    const result = isDealCancellationInDraft();

    expect(result).toEqual(false);
  });
});
