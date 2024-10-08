const { dealHasAllValidUkefIds } = require('./dealHasAllUkefIds');
const allPartiesHaveUrn = require('./all-parties-have-urn');
const CONSTANTS = require('../../constants');

/**
 * Checks if a deal is eligible for submission to ACBS (Automated Commercial Banking System).
 * Validates various prerequisites such as the deal object, submission type, first submission status,
 * valid UK Export Finance (UKEF) IDs, and the presence of required parties' URNs.
 *
 * @param {object} deal - The deal object containing information about the deal.
 * @param {boolean} [firstSubmissionCheck=true] - Flag to check if it is the first submission.
 * @returns {Promise<boolean>} - A boolean value indicating whether the deal is eligible for submission to ACBS.
 * @throws {Error} - If the deal object is invalid.
 */
const canSubmitToACBS = async (deal, firstSubmissionCheck = true) => {
  try {
    if (!deal?._id || !deal?.dealSnapshot || !deal?.tfm) {
      throw new Error('Invalid deal object supplied');
    }

    const { _id, dealSnapshot, tfm } = deal;
    const acceptable = [CONSTANTS.DEALS.SUBMISSION_TYPE.AIN, CONSTANTS.DEALS.SUBMISSION_TYPE.MIN];

    console.info('⚡ Validating ACBS deal %s prerequisites.', _id);

    // Check 1: Ensure submission type is `Notice`
    const validSubmissionType = acceptable.includes(dealSnapshot?.submissionType);
    // Check 2: Ensure ACBS records exist
    const validFirstSubmission = firstSubmissionCheck ? !tfm?.acbs : true;
    // Check 3: Ensure IDs are valid
    const { status: validIds } = await dealHasAllValidUkefIds(_id);
    // Check 4: Ensure all required parties have URN
    const allRequiredPartiesHaveUrn = allPartiesHaveUrn(deal);

    // Evaluate
    const eligible = validSubmissionType && validFirstSubmission && validIds && allRequiredPartiesHaveUrn;

    if (eligible) {
      console.info('✅ Deal %s is eligible for submission to ACBS.', _id);
    }

    return eligible;
  } catch (error) {
    console.error('Unable to submit deal to ACBS %o', error);
    return false;
  }
};

module.exports = canSubmitToACBS;
