const completedFacilityStatus = ['Completed', 'Acknowledged'];

const hasIncompleteBonds = (deal) => {
  const allBonds = deal.facilities.filter((facility) => facility.type === 'Bond');
  const totalBonds = allBonds.length;
  const completed = allBonds.filter((b) => completedFacilityStatus.includes(b.status));

  if (totalBonds === completed.length) {
    return false;
  }

  return true;
};

const hasIncompleteLoans = (deal) => {
  const allLoans = deal.facilities.filter((facility) => facility.type === 'Loan');
  const totalLoans = allLoans.length;
  const completed = allLoans.filter((l) => completedFacilityStatus.includes(l.status));

  if (totalLoans === completed.length) {
    return false;
  }

  return true;
};

const hasAtLeastOneLoanOrBond = (deal) => {
  const bonds = deal.facilities.filter((facility) => facility.type === 'Bond');
  const loans = deal.facilities.filter((facility) => facility.type === 'Loan');

  if (bonds.length > 0 || loans.length > 0) {
    return true;
  }

  return false;
};

const submissionDetailsComplete = (deal) => deal.submissionDetails && deal.submissionDetails.status === 'Completed';

const eligibilityComplete = (deal) => deal.eligibility && deal.eligibility.status === 'Completed';

const dealHasIncompleteTransactions = (deal) => (hasIncompleteBonds(deal) || hasIncompleteLoans(deal));

const dealFormsCompleted = (deal) =>
  eligibilityComplete(deal)
    && submissionDetailsComplete(deal)
    && hasAtLeastOneLoanOrBond(deal)
    && !dealHasIncompleteTransactions(deal);

module.exports = {
  dealFormsCompleted,
  dealHasIncompleteTransactions,
};
