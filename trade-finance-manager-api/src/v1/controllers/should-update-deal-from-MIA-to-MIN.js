const CONSTANTS = require('../../constants');

/**
 * Determines whether a deal submission type
 * can be updated from MIA to MIN.
 *
 * @param {object} deal - The portal deal object.
 * @param {object} tfmDeal - The TFM deal object (deal.tfm).
 * @returns {boolean} - True if the deal should be updated, false otherwise.
 */
const shouldUpdateDealFromMIAtoMIN = (deal, tfmDeal) => {
  if (!deal || !tfmDeal?.underwriterManagersDecision) {
    console.error('Deal %s does not exist in TFM', deal?._id);
    return false;
  }

  const ukefApprovedDecisions = [CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITH_CONDITIONS, CONSTANTS.DEALS.DEAL_STAGE_TFM.UKEF_APPROVED_WITHOUT_CONDITIONS];
  const isMIA = deal.submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA;
  const hasApprovedDecision = ukefApprovedDecisions.includes(tfmDeal?.underwriterManagersDecision?.decision);

  console.info('Updating deal %s submission type to MIN %s %s', deal._id, isMIA, hasApprovedDecision);

  return isMIA && hasApprovedDecision;
};

exports.shouldUpdateDealFromMIAtoMIN = shouldUpdateDealFromMIAtoMIN;
