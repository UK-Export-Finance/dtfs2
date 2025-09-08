const { shouldUpdateDealFromMIAtoMIN } = require('./should-update-deal-from-MIA-to-MIN');
const CONSTANTS = require('../../constants');

describe('shouldUpdateDealFromMIAtoMIN', () => {
  const _id = 123;
  const miaDeal = {
    _id,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
  };

  const minDeal = {
    _id,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIN,
  };

  const ainDeal = {
    _id,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.AIN,
  };

  const tfmDealApprovedWithConditions = {
    underwriterManagersDecision: {
      decision: CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS,
    },
  };

  const tfmDealApprovedWithoutConditions = {
    underwriterManagersDecision: {
      decision: CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS,
    },
  };

  const tfmDealDeclined = {
    underwriterManagersDecision: {
      decision: CONSTANTS.DEALS.DEAL_STAGE_TFM.DECLINED,
    },
  };

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(null, null);

    expect(result).toEqual(false);
  });

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(miaDeal, null);

    expect(result).toEqual(false);
  });

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(minDeal, null);

    expect(result).toEqual(false);
  });

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(ainDeal, null);

    expect(result).toEqual(false);
  });

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(null, tfmDealApprovedWithConditions);

    expect(result).toEqual(false);
  });

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(null, tfmDealApprovedWithoutConditions);

    expect(result).toEqual(false);
  });

  it('should return false when deal object is null', () => {
    const result = shouldUpdateDealFromMIAtoMIN(null, tfmDealDeclined);

    expect(result).toEqual(false);
  });

  it('should log an error message when deal does not exist either in Portal or in TFM', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    shouldUpdateDealFromMIAtoMIN(null, tfmDealApprovedWithConditions);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Deal %s does not exist in TFM', undefined);

    consoleErrorSpy.mockRestore();
  });

  it('should return true when deal submission type is MIA and TFM deal object has an underwriter manager decision that is UKEF approved with or without conditions', () => {
    const result = shouldUpdateDealFromMIAtoMIN(miaDeal, tfmDealApprovedWithConditions);

    expect(result).toEqual(true);
  });

  it('should return true when deal submission type is MIA and TFM deal object has an underwriter manager decision that is UKEF approved with or without conditions', () => {
    const result = shouldUpdateDealFromMIAtoMIN(miaDeal, tfmDealApprovedWithoutConditions);

    expect(result).toEqual(true);
  });

  it('should return false when deal submission type is MIA and TFM deal object has an underwriter manager decision that is UKEF has declined', () => {
    const result = shouldUpdateDealFromMIAtoMIN(miaDeal, tfmDealDeclined);

    expect(result).toEqual(false);
  });

  it('should return false when deal submission type is not MIA and TFM deal object has an underwriter manager decision that is UKEF approved with or without conditions', () => {
    const result = shouldUpdateDealFromMIAtoMIN(minDeal, tfmDealApprovedWithConditions);

    expect(result).toEqual(false);
  });

  it('should return false when deal submission type is not MIA and TFM deal object has an underwriter manager decision that is UKEF approved with or without conditions', () => {
    const result = shouldUpdateDealFromMIAtoMIN(minDeal, tfmDealApprovedWithoutConditions);

    expect(result).toEqual(false);
  });

  it('should return false when deal submission type is MIA and TFM deal object has an underwriter manager decision that is UKEF has declined', () => {
    const result = shouldUpdateDealFromMIAtoMIN(minDeal, tfmDealDeclined);

    expect(result).toEqual(false);
  });

  it('should return false when deal submission type is not MIA and TFM deal object has an underwriter manager decision that is UKEF approved with or without conditions', () => {
    const result = shouldUpdateDealFromMIAtoMIN(ainDeal, tfmDealApprovedWithConditions);

    expect(result).toEqual(false);
  });

  it('should return false when deal submission type is not MIA and TFM deal object has an underwriter manager decision that is UKEF approved with or without conditions', () => {
    const result = shouldUpdateDealFromMIAtoMIN(ainDeal, tfmDealApprovedWithoutConditions);

    expect(result).toEqual(false);
  });

  it('should return false when deal submission type is MIA and TFM deal object has an underwriter manager decision that is UKEF has declined', () => {
    const result = shouldUpdateDealFromMIAtoMIN(ainDeal, tfmDealDeclined);

    expect(result).toEqual(false);
  });

  it('should log an info message for MIA deal after pre-condition check and before returning response back', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    shouldUpdateDealFromMIAtoMIN(miaDeal, tfmDealApprovedWithConditions);

    expect(consoleInfoSpy).toHaveBeenCalledWith('Updating deal %s submission type to MIN %s %s', miaDeal._id, true, true);

    consoleInfoSpy.mockRestore();
  });

  it('should log an info message for MIA deal after pre-condition check and before returning response back', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    shouldUpdateDealFromMIAtoMIN(miaDeal, tfmDealDeclined);

    expect(consoleInfoSpy).toHaveBeenCalledWith('Updating deal %s submission type to MIN %s %s', miaDeal._id, true, false);

    consoleInfoSpy.mockRestore();
  });

  it('should log an info message for an AIN deal after pre-condition check and before returning response back', () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();

    shouldUpdateDealFromMIAtoMIN(ainDeal, tfmDealApprovedWithConditions);

    expect(consoleInfoSpy).toHaveBeenCalledWith('Updating deal %s submission type to MIN %s %s', ainDeal._id, false, true);

    consoleInfoSpy.mockRestore();
  });
});
