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

    /**
     * The builder creates a valid deal object for the amendment button.
     * The success tests set a specific variable to ensure that given a deal is otherwise valid,
     * when the testing variable is changed, the button is shown.
     */
    function getSuccessTestCases() {
      return [
        {
          description: `submission type is ${DEAL.SUBMISSION_TYPE.AIN}`,
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL.SUBMISSION_TYPE.AIN).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `submission type is ${DEAL.SUBMISSION_TYPE.MIN}`,
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL.SUBMISSION_TYPE.MIN).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `deal stage is ${DEAL.DEAL_STAGE.CONFIRMED}`,
          deal: new AmendmentButtonDealBuilder().withTfmStage(DEAL.DEAL_STAGE.CONFIRMED).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `deal stage is ${DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS}`,
          deal: new AmendmentButtonDealBuilder().withTfmStage(DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `user is in ${TEAM_IDS.PIM} team`,
          deal: new AmendmentButtonDealBuilder().build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `user is in ${TEAM_IDS.PIM} team and another team`,
          deal: new AmendmentButtonDealBuilder().build(),
          userTeams: [...defaultUserTeams, TEAM_IDS.UNDERWRITER_MANAGERS],
        },
        {
          description: `deal is not ${DEAL_STATUS.CANCELLED} or ${DEAL_STATUS.PENDING_CANCELLATION}`,
          deal: new AmendmentButtonDealBuilder().withStatus(DEAL_STATUS.COMPLETED).build(),
          userTeams: defaultUserTeams,
        },
      ];
    }

    /**
     * The builder creates a valid deal object for the amendment button.
     * The failure tests set a specific variable to ensure that given a deal is otherwise valid,
     * when the testing variable is changed, the button is not shown.
     */
    function getFailureTestCases() {
      return [
        {
          description: `submission type is not ${DEAL.SUBMISSION_TYPE.AIN} or ${DEAL.SUBMISSION_TYPE.MIN}`,
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL.SUBMISSION_TYPE.MIA).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `user teams is not ${TEAM_IDS.PIM}`,
          deal: new AmendmentButtonDealBuilder().build(),
          userTeams: [TEAM_IDS.UNDERWRITER_MANAGERS],
        },
        {
          description: `deal stage is not ${DEAL_STATUS.CONFIRMED} or ${DEAL_STATUS.AMENDMENT_IN_PROGRESS}`,
          deal: new AmendmentButtonDealBuilder().withDealSnapshotSubmissionType(DEAL_STATUS.DRAFT).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `deal is ${DEAL_STATUS.CANCELLED}`,
          deal: new AmendmentButtonDealBuilder().withStatus(DEAL_STATUS.CANCELLED).build(),
          userTeams: defaultUserTeams,
        },
        {
          description: `deal is ${DEAL_STATUS.PENDING_CANCELLATION}`,
          deal: new AmendmentButtonDealBuilder().withStatus(DEAL_STATUS.PENDING_CANCELLATION).build(),
          userTeams: defaultUserTeams,
        },
      ];
    }
  });
});
