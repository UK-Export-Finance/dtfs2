const CONSTANTS = require('../../constants');

const shouldUpdateDealFromMIAtoMIN = (deal, tfmDeal) => {
  const isMIA = deal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA;

  if (Object.prototype.hasOwnProperty.call(tfmDeal, 'underwriterManagersDecision')) {
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
