const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const dealSubmissionDate = `${dateConstants.yesterdayUnix}000`;
  const coverStartDateBeforeDealSubmissionDate = `${dateConstants.sevenDaysAgoUnix}000`;

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.loanTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.loanTransactions.items[0]['coverEndDate-day'] = (dateConstants.oneMonthDay).toString();
  deal.loanTransactions.items[0]['coverEndDate-month'] = (dateConstants.oneMonthMonth).toString();
  deal.loanTransactions.items[0]['coverEndDate-year'] = (dateConstants.oneMonthYear).toString();
  deal.loanTransactions.items[0].facilityStage = 'Unconditional';
  deal.loanTransactions.items[0].hasBeenIssued = true;

  return deal;
};
