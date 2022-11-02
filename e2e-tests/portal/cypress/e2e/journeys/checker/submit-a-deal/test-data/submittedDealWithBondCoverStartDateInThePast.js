const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const dealSubmissionDate = `${dateConstants.yesterdayUnix}000`;
  const coverStartDateBeforeDealSubmissionDate = `${dateConstants.sevenDaysAgoUnix}000`;

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.bondTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.bondTransactions.items[0]['coverEndDate-day'] = (dateConstants.oneMonthDay).toString();
  deal.bondTransactions.items[0]['coverEndDate-month'] = (dateConstants.oneMonthMonth).toString();
  deal.bondTransactions.items[0]['coverEndDate-year'] = (dateConstants.oneMonthYear).toString();
  deal.bondTransactions.items[0].facilityStage = 'Issued';
  deal.bondTransactions.items[0].name = '1234';

  return deal;
};
