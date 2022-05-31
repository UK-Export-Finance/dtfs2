import { showAmendmentButton } from './amendments.helper';
import { userCanEditBankDecision, userCanEditLeadUnderwriter, userCanEditManagersDecision } from '.';

import MOCKS from '../../test-mocks/amendment-test-mocks';

const CONSTANTS = require('../../constants');

describe('showAmendmentButton()', () => {
  const deal = {
    dealSnapshot: {},
    tfm: {},
  };
  let userTeam;
  it('return true if AIN and confirmed and PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
    userTeam = ['PIM'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(true);
  });

  it('return false if AIN and confirmed and not PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
    userTeam = ['UNDERWRITER_MANAGERS'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });

  it('return false if AIN and not confirmed and PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.AIN;
    userTeam = ['PIM'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });

  it('return true if MIN and confirmed and PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
    userTeam = ['PIM'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(true);
  });

  it('return false if MIN and confirmed and not PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
    userTeam = ['UNDERWRITER_MANAGERS'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });

  it('return false if MIN and not confirmed and PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
    userTeam = ['PIM'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });

  it('return false if MIA and confirmed and PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    userTeam = ['PIM'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });

  it('return false if MIA and confirmed and not PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    userTeam = ['UNDERWRITER_MANAGERS'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.CONFIRMED;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });

  it('return false if MIA and not confirmed and PIM', () => {
    deal.dealSnapshot.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
    userTeam = ['PIM'];
    deal.tfm.stage = CONSTANTS.DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS;

    const result = showAmendmentButton(deal, userTeam);
    expect(result).toEqual(false);
  });
});

describe('userCanEditLeadUnderwriter()', () => {
  it('should return `true` if the user is in Underwriter Managers team', () => {
    const result = userCanEditLeadUnderwriter(MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(true);
  });

  it('should return `false` if the user is in PIM team', () => {
    const result = userCanEditLeadUnderwriter(MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });

  it('should return `true` if the user is in underwriting team', () => {
    const result = userCanEditLeadUnderwriter(MOCKS.MOCK_USER_UNDERWRITER);
    expect(result).toEqual(true);
  });
});

describe('userCanEditManagersDecision()', () => {
  it('should return `true` if the user is in Underwriter Managers team and does not have underwriter managers decision', () => {
    const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(true);
  });

  it('should return `false` if the user is in not in Underwriting team', () => {
    const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_UNDERWRITER);
    expect(result).toEqual(false);
  });

  it('should return `false` if the user is in underwriter managers team and amendment has underwriter managers decision', () => {
    const result = userCanEditManagersDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });
});

describe('userCanEditBankDecision()', () => {
  it('should return `false` if the  user is in PIM team and amendment does not have underwriter managers decision', () => {
    const result = userCanEditBankDecision(MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(false);
  });

  it('should return `false` if the user is in not in PIM team', () => {
    const result = userCanEditBankDecision(MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_NOT_SUBMITTED, MOCKS.MOCK_USER_UNDERWRITER_MANAGER);
    expect(result).toEqual(false);
  });

  it('should return `true` if the user is in PIM team and bank\'s decision has been NOT submitted', () => {
    const amendment = {
      ...MOCKS.MOCK_AMENDMENT_UNDERWRITER_DECISION_SUBMITTED,
      bankDecision: { submitted: false },
    };

    const result = userCanEditBankDecision(amendment, MOCKS.MOCK_USER_PIM);
    expect(result).toEqual(true);
  });
});
