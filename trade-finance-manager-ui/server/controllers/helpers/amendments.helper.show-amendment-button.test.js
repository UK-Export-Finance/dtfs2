import { TEAM_IDS } from '@ukef/dtfs2-common';
import { showAmendmentButton } from './amendments.helper';

const CONSTANTS = require('../../constants');

describe('amendments helper', () => {
  describe('showAmendmentButton()', () => {
    const deal = {
      dealSnapshot: {},
      tfm: {},
    };
    let userTeam;

    it('return true if AIN and confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(true);
    });

    it('return true if AIN and amendment in progress and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(true);
    });

    it('return false if AIN and confirmed and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = [TEAM_IDS.UNDERWRITER_MANAGERS];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if AIN and amendment in progress and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = [TEAM_IDS.UNDERWRITER_MANAGERS];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if AIN and not confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return true if MIN and confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(true);
    });

    it('return true if MIN and amendment in progress and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(true);
    });

    it('return false if MIN and amendment in progress and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = [TEAM_IDS.UNDERWRITER_MANAGERS];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIN and confirmed and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = [TEAM_IDS.UNDERWRITER_MANAGERS];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIN and not confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIA and confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIA and confirmed and not PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
      userTeam = [TEAM_IDS.UNDERWRITER_MANAGERS];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });

    it('return false if MIA and not confirmed and PIM', () => {
      deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
      userTeam = [TEAM_IDS.PIM];
      deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

      const result = showAmendmentButton(deal, userTeam);
      expect(result).toEqual(false);
    });
  });
});
