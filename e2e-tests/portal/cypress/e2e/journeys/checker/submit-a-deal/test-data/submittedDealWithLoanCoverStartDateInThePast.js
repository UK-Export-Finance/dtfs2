const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const { yesterday, sevenDaysAgo, oneMonth } = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const dealSubmissionDate = yesterday.unixMilliseconds; // TODO: Standardise this coding style
  const coverStartDateBeforeDealSubmissionDate = sevenDaysAgo.unixMilliseconds;

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.loanTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.loanTransactions.items[0]['coverEndDate-day'] = oneMonth.day;
  deal.loanTransactions.items[0]['coverEndDate-month'] = oneMonth.month;
  deal.loanTransactions.items[0]['coverEndDate-year'] = oneMonth.year;
  deal.loanTransactions.items[0].facilityStage = 'Unconditional';
  deal.loanTransactions.items[0].hasBeenIssued = true;

  return deal;
};
