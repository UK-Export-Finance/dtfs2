const CONSTANTS = require('../constants');

/**
 * Checks if a facility is complete by filtering its items based on their status and certain conditions,
 * and then comparing the length of the filtered arrays with the total number of items.
 * @param {object} facilities - The facility object containing an array of items.
 * @returns {boolean} - True if the facility is complete, false otherwise.
 */
const isEveryFacilityComplete = (facilities = []) => {
  const facilityProcessedStatus = [CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED, CONSTANTS.STATUS.DEAL.SUBMITTED_TO_UKEF];

  const completed = facilities.filter((facility) => facility.status === CONSTANTS.STATUS.FACILITY.COMPLETED).length;
  const incomplete = facilities.filter((facility) => facility.status === CONSTANTS.STATUS.FACILITY.INCOMPLETE).length;
  const notStarted = facilities.filter((facility) => facility.status === CONSTANTS.STATUS.FACILITY.NOT_STARTED).length;
  const acknowledged = facilities.filter(
    (facility) => facilityProcessedStatus.includes(facility.status) && facility.requestedCoverStartDate && facility.coverDateConfirmed,
  ).length;

  const canBeSubmitted = completed + acknowledged;
  const canNotBeSubmitted = incomplete + notStarted;
  const total = canBeSubmitted + canNotBeSubmitted;

  /**
   * Ensure total facilities are not all in cannot be submitted status.
   * Need atleast one minimum facility from canBeSubmitted status to allow
   * maker to submit the deal further to the checker.
   *
   * Note: A maker can submit one facility at a time therefore remaining facilities
   * can be in `Not Started`.
   */
  return facilities.length === total && facilities.length !== canNotBeSubmitted && !incomplete;
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
 * @param {object} deal - The deal object.
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
 * Checks if every facility in a deal is complete by calling the `isEveryFacilityComplete` function.
 * @param {object} deal - The deal object containing bond and loan transactions.
 * @returns {boolean} - Returns true if every facility in the deal is complete, otherwise returns false.
 */
const isEveryFacilityInDealComplete = (deal) => {
  const facilities = [...(deal.bondTransactions?.items ?? []), ...(deal.loanTransactions?.items ?? [])];

  return isEveryFacilityComplete(facilities);
};

/**
 * Determines if all forms in a deal are completed.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if all forms are completed, false otherwise.
 */
const isEveryDealFormComplete = (deal) =>
  isEligibilityComplete(deal) && isSubmissionDetailComplete(deal) && hasAtLeastOneLoanOrBond(deal) && isEveryFacilityInDealComplete(deal);

module.exports = {
  isEligibilityComplete,
  isSubmissionDetailComplete,
  isEveryFacilityComplete,
  isEveryFacilityInDealComplete,
  isEveryDealFormComplete,
};
