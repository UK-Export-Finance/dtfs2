const CONSTANTS = require('../constants');

/**
 * Checks if a given facility is complete with respect to the current facility status.
 * @param {Object} facility - An object representing a facility with an `items` property that contains an array of items.
 * @returns {boolean} - `true` if there are no incomplete items, `false` otherwise.
 */
const isFacilityComplete = (facility) => {
  const items = facility?.items || [];
  const facilityProcessedStatus = [CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF];

  const completed = items.filter((item) => item.status === CONSTANTS.STATUS.SECTION.COMPLETED);
  const acknowledged = items.filter((item) => facilityProcessedStatus.includes(item.status) && item.requestedCoverStartDate && item.coverDateConfirmed);

  return items.length === completed.length + acknowledged.length;
};

/**
 * Checks if a deal has at least one loan or bond.
 * @param {object} deal - The deal object containing loanTransactions and bondTransactions properties.
 * @returns {boolean} - True if the deal has at least one loan or bond, false otherwise.
 */
const hasAtLeastOneLoanOrBond = (deal) => {
  const hasLoan = Boolean(deal?.loanTransactions?.items?.length);
  const hasBond = Boolean(deal?.bondTransactions?.items?.length);

  return hasLoan || hasBond;
};

/**
 * Checks if the submission details of a deal are complete.
 *
 * @param {Object} deal - The deal object.
 * @returns {boolean} - Returns true if the submission details are complete, otherwise false.
 */
const isSubmissionDetailComplete = (deal) => deal?.submissionDetails?.status === CONSTANTS.STATUS.SECTION.COMPLETED;

/**
 * Checks if the eligibility section of a deal is completed.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if the eligibility section is completed, false otherwise.
 */
const isEligibilityComplete = (deal) => deal?.eligibility?.status === CONSTANTS.STATUS.SECTION.COMPLETED;

/**
 * Determines if a deal has any incomplete facilities.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if the deal has incomplete facilities, false otherwise.
 */
const isEveryFacilityComplete = (deal) => isFacilityComplete(deal?.bondTransactions) && isFacilityComplete(deal?.loanTransactions);

/**
 * Determines if all forms in a deal are completed.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if all forms are completed, false otherwise.
 */
const isEveryDealFormComplete = (deal) =>
  isEligibilityComplete(deal) && isSubmissionDetailComplete(deal) && hasAtLeastOneLoanOrBond(deal) && isEveryFacilityComplete(deal);

module.exports = {
  isEligibilityComplete,
  isSubmissionDetailComplete,
  isEveryFacilityComplete,
  isEveryDealFormComplete,
};
