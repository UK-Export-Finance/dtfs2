// TODO - perhaps each of these sections should have their own rules for this that we call on here?
const allBondsCompleted = (deal) => deal.bondTransactions
        && deal.bondTransactions.items
        && deal.bondTransactions.items.filter((b) => b.status !== 'Completed').length === 0;

const submissionDetailsComplete = (deal) => deal.submissionDetails && deal.submissionDetails.status === 'Completed';

const eligibilityComplete = (deal) => deal.eligibility && deal.eligibility.status === 'Completed';

const dealFormsCompleted = (deal) =>
// TODO loans...

  eligibilityComplete(deal)
      && allBondsCompleted(deal)
      && submissionDetailsComplete(deal);
export default dealFormsCompleted;
