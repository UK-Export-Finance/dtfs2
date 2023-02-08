const CONSTANTS = require('../../constants');

const shouldUpdateDealFromMIAtoMIN = (deal, tfmDeal) => {
  if (!tfmDeal) {
    console.error(`${deal._id} TFM object does not exists`);
    return false;
  }

  const isMIA = deal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA;

  if (tfmDeal.underwriterManagersDecision) {
    const hasApprovedDecision = (tfmDeal.underwriterManagersDecision
    && (tfmDeal.underwriterManagersDecision.decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS
    || tfmDeal.underwriterManagersDecision.decision === CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS));

    if (isMIA && hasApprovedDecision) {
      return true;
    }
  }

  return false;
};

exports.shouldUpdateDealFromMIAtoMIN = shouldUpdateDealFromMIAtoMIN;
