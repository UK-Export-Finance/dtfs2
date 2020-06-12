// TODO - perhaps each of these sections should have their own rules for this that we call on here?

const hasCompletedBonds = (deal) => {
  const allBonds = deal.bondTransactions && deal.bondTransactions.items;
  const totalBonds = allBonds.length;
  const completed = allBonds.filter((b) => b.status === 'Completed');

  if (totalBonds >= 1 && totalBonds === completed.length) {
    return true;
  }

  return false;
};

const submissionDetailsComplete = (deal) => deal.submissionDetails && deal.submissionDetails.status === 'Completed';

const eligibilityComplete = (deal) => deal.eligibility && deal.eligibility.status === 'Completed';

const dealFormsCompleted = (deal) =>
  eligibilityComplete(deal)
  && hasCompletedBonds(deal)
  && submissionDetailsComplete(deal);

export default dealFormsCompleted;
