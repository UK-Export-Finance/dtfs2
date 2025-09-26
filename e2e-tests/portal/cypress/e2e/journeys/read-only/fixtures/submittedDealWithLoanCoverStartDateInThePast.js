const { yesterday, sevenDaysAgo, oneMonth } = require('@ukef/dtfs2-common/test-helpers');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const dealSubmissionDate = yesterday.unixMillisecondsString; // TODO: Standardise this coding style
  const coverStartDateBeforeDealSubmissionDate = sevenDaysAgo.unixMillisecondsString;

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
