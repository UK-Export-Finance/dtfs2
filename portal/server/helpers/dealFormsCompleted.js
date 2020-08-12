// TODO - perhaps each of these sections should have their own rules for this that we call on here?

const completedFacilityStatus = ['Completed', 'Acknowledged by UKEF'];

const hasIncompleteBonds = (deal) => {
  const allBonds = deal.bondTransactions && deal.bondTransactions.items;
  const totalBonds = allBonds.length;
  const completed = allBonds.filter((b) => completedFacilityStatus.includes(b.status));

  if (totalBonds === completed.length) {
    return false;
  }

  return true;
};

const hasIncompleteLoans = (deal) => {
  const allLoans = deal.loanTransactions && deal.loanTransactions.items;
  const totalLoans = allLoans.length;
  const completed = allLoans.filter((l) => completedFacilityStatus.includes(l.status));

  if (totalLoans === completed.length) {
    return false;
  }

  return true;
};

const hasAtLeastOneLoanOrBond = (deal) => deal.loanTransactions.items.length > 0
                                       || deal.bondTransactions.items.length > 0;

const submissionDetailsComplete = (deal) => deal.submissionDetails && deal.submissionDetails.status === 'Completed';

const eligibilityComplete = (deal) => deal.eligibility && deal.eligibility.status === 'Completed';

export const dealHasIncompleteTransactions = (deal) => (hasIncompleteBonds(deal) || hasIncompleteLoans(deal));

const dealFormsCompleted = (deal) =>
  eligibilityComplete(deal)
    && submissionDetailsComplete(deal)
    && hasAtLeastOneLoanOrBond(deal)
    && !dealHasIncompleteTransactions(deal);

export default dealFormsCompleted;
