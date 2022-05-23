import { showAmendmentButton } from './amendments.helper';

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
