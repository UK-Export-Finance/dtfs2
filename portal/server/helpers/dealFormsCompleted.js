const CONSTANTS = require('../constants');

/**
 * Checks if a given facility has any incomplete items.
 * @param {Object} facility - An object representing a facility with an `items` property that contains an array of items.
 * @returns {boolean} - `true` if there are incomplete items, `false` otherwise.
 */
const hasIncompleteFacility = (facility) => {
  const items = facility?.items || [];

  const completed = items.filter((item) => item.status === CONSTANTS.STATUS.SECTION.COMPLETED);
  const acknowledged = items.filter(
    (item) => item.status === CONSTANTS.STATUS.DEAL.UKEF_ACKNOWLEDGED && item.requestedCoverStartDate && item.coverDateConfirmed,
  );

  return items.length !== completed.length + acknowledged.length;
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
const submissionDetailsComplete = (deal) => deal?.submissionDetails?.status === CONSTANTS.STATUS.SECTION.COMPLETED;

/**
 * Checks if the eligibility section of a deal is completed.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if the eligibility section is completed, false otherwise.
 */
const eligibilityComplete = (deal) => deal?.eligibility?.status === CONSTANTS.STATUS.SECTION.COMPLETED;

/**
 * Determines if a deal has any incomplete facilities.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if the deal has incomplete facilities, false otherwise.
 */
const dealHasIncompleteTransactions = (deal) => hasIncompleteFacility(deal.bondTransactions) || hasIncompleteFacility(deal.loanTransactions);

/**
 * Determines if all forms in a deal are completed.
 *
 * @param {object} deal - The deal object.
 * @returns {boolean} - True if all forms are completed, false otherwise.
 */
const dealFormsCompleted = (deal) =>
  eligibilityComplete(deal) && submissionDetailsComplete(deal) && hasAtLeastOneLoanOrBond(deal) && !dealHasIncompleteTransactions(deal);

module.exports = {
  dealFormsCompleted,
  dealHasIncompleteTransactions,
};
