const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date;
  };
  const dealSubmissionDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  };
  const coverStartDateBeforeDealSubmissionDate = () => {
    const date = new Date(dealSubmissionDate());
    date.setDate(date.getDate() - 7);
    return date;
  };

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate().valueOf();

  deal.loanTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate().valueOf();

  deal.loanTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture().getDate();
  deal.loanTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture().getMonth() + 1;
  deal.loanTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture().getFullYear();
  deal.loanTransactions.items[0].facilityStage = 'Unconditional';

  return deal;
};
