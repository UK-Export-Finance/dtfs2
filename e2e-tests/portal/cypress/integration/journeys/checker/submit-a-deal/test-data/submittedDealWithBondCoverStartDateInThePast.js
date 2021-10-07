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

  deal.bondTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate().valueOf();

  deal.bondTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture().getDate();
  deal.bondTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture().getMonth() + 1;
  deal.bondTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture().getFullYear();
  deal.bondTransactions.items[0].facilityStage = 'Issued';
  deal.bondTransactions.items[0].uniqueIdentificationNumber = '1234';

  return deal;
};
