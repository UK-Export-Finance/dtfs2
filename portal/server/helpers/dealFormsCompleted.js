const CONSTANTS = require('../constants');

/**
 * Checks if a facility is complete by filtering its items based on their status and certain conditions,
 * and then comparing the length of the filtered arrays with the total number of items.
 * @param {Object} facilities - The facility object containing an array of items.
 * @returns {boolean} - True if the facility is complete, false otherwise.
 */
const isFacilityComplete = (facilities = []) => {
  const facilityProcessedStatus = [CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF];

  const completed = facilities.filter((facility) => facility.status === CONSTANTS.STATUS.FACILITY.COMPLETED).length;
  const incomplete = facilities.filter((facility) => facility.status === CONSTANTS.STATUS.FACILITY.INCOMPLETE).length;
  const notStarted = facilities.filter((facility) => facility.status === CONSTANTS.STATUS.FACILITY.NOT_STARTED).length;
  const acknowledged = facilities.filter(
    (facility) => facilityProcessedStatus.includes(facility.status) && facility.requestedCoverStartDate && facility.coverDateConfirmed,
  ).length;

  const total = completed + incomplete + notStarted + acknowledged;

  return facilities.length === total && facilities.length !== notStarted && facilities.length !== incomplete;
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
 * Checks if every facility in a deal is complete by calling the `isFacilityComplete` function.
 * @param {object} deal - The deal object containing bond and loan transactions.
 * @returns {boolean} - Returns true if every facility in the deal is complete, otherwise returns false.
 */
const isEveryFacilityComplete = (deal) => {
  const facilities = [...(deal.bondTransactions?.items ?? []), ...(deal.loanTransactions?.items ?? [])];
  return isFacilityComplete(facilities);
};

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
  isFacilityComplete,
  isEveryFacilityComplete,
  isEveryDealFormComplete,
};
