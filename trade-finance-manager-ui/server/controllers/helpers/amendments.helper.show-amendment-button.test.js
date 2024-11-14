import { TEAM_IDS, DEAL_STATUS } from '@ukef/dtfs2-common';
import { showAmendmentButton } from './amendments.helper';
import { AmendmentButtonDealBuilder } from '../../test-mocks/show-amendments-button-deal-builder';
import { DEAL } from '../../constants';

describe('amendments helper', () => {
  describe('showAmendmentButton()', () => {
    const defaultUserTeams = [TEAM_IDS.PIM];

    it.each(getSuccessTestCases())('should return true when $description', ({ deal, userTeams }) => {
      const result = showAmendmentButton(deal, userTeams);
      expect(result).toEqual(true);
    });

    it.each(getFailureTestCases())('should return false when $description', ({ deal, userTeams }) => {
      const result = showAmendmentButton(deal, userTeams);
      expect(result).toEqual(false);
    });

    function getSuccessTestCases() {
      return [
        {
          description: 'submission type is AIN',
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL.SUBMISSION_TYPE.AIN).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'submissionType is MIN',
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL.SUBMISSION_TYPE.MIN).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'deal stage is confirmed',
          deal: new AmendmentButtonDealBuilder().withTfmStage(DEAL.DEAL_STAGE.CONFIRMED).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'deal stage is amendment in progress',
          deal: new AmendmentButtonDealBuilder().withTfmStage(DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'user is in PIM team',
          deal: new AmendmentButtonDealBuilder().build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'user is in PIM team and another team',
          deal: new AmendmentButtonDealBuilder().build(),
          userTeams: [...defaultUserTeams, TEAM_IDS.UNDERWRITER_MANAGERS],
        },
        {
          description: 'deal is not cancelled or pending cancellation',
          deal: new AmendmentButtonDealBuilder().withStatus(DEAL_STATUS.COMPLETED).build(),
          userTeams: defaultUserTeams,
        },
      ];
    }

    function getFailureTestCases() {
      return [
        {
          description: 'submission type is not AIN or MIN',
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType('MIA').build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'user teams is not PIM',
          deal: new AmendmentButtonDealBuilder().build(),
          userTeams: [TEAM_IDS.UNDERWRITER_MANAGERS],
        },
        {
          description: 'deal stage is not confirmed or amendment in progress',
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL_STATUS.DRAFT).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'deal is cancelled',
          deal: new AmendmentButtonDealBuilder().withStatus(DEAL_STATUS.CANCELLED).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: 'deal is pending cancellation',
          deal: new AmendmentButtonDealBuilder().withStatus(DEAL_STATUS.PENDING_CANCELLATION).build(),
          userTeams: defaultUserTeams,
        },
      ];
    }
  });
});
