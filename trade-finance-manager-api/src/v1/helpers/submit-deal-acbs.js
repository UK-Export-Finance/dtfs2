const { dealHasAllValidUkefIds } = require('./dealHasAllUkefIds');
const { submitACBSIfAllPartiesHaveUrn } = require('../controllers/deal.controller');
const CONSTANTS = require('../../constants');

/**
 * Submit's deal to ACBS through the means of verification.
 * This function performs following checks:
 * 1. Valid submission type either AIN or MIN
 * 2. Valid first submission check, ensuring `tfm.acbs` property does not exist
 * 3. Valid deal and facility IDs
 * @param {Object} deal - TFM deal object
 * @param {boolean} [firstSubmissionCheck=true] - Flag indicating whether to perform the first submission check, defaults to `true`
 * @param {boolean} [validateOnly=false] - Flag indicating whether to just to perform validation, defaults to `false`
 * @returns {boolean} - True if the deal can be submitted to ACBS, otherwise false.
 */
const submitDealToACBS = async (deal, firstSubmissionCheck = true, validateOnly = false) => {
  try {
    const { _id, dealSnapshot, tfm } = deal;
    const acceptable = [CONSTANTS.DEALS.SUBMISSION_TYPE.AIN, CONSTANTS.DEALS.SUBMISSION_TYPE.MIN];

    console.info('⚡ Validating ACBS checks for deal %s', _id);

    const validSubmissionType = acceptable.includes(dealSnapshot?.submissionType);
    const validFirstSubmission = firstSubmissionCheck ? !tfm?.acbs : true;
    const validIds = await dealHasAllValidUkefIds(_id);
    const eligible = validSubmissionType && validFirstSubmission && validIds;

    console.log('====4', validSubmissionType, validFirstSubmission, validIds?.status);

    if (eligible && !validateOnly) {
      await submitACBSIfAllPartiesHaveUrn(_id);
    }

    return eligible;
  } catch (error) {
    console.error('Unable to submit deal to ACBS %o', error);
    return false;
  }
};

module.exports = submitDealToACBS;
