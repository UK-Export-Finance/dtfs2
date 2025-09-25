const { oneMonth, yesterday, sevenDaysAgo } = require('@ukef/dtfs2-common/test-helpers');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const dealSubmissionDate = yesterday.unixMillisecondsString; // TODO: Standardise this coding style
  const coverStartDateBeforeDealSubmissionDate = sevenDaysAgo.unixMillisecondsString;

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.bondTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.bondTransactions.items[0]['coverEndDate-day'] = oneMonth.day;
  deal.bondTransactions.items[0]['coverEndDate-month'] = oneMonth.month;
  deal.bondTransactions.items[0]['coverEndDate-year'] = oneMonth.year;
  deal.bondTransactions.items[0].facilityStage = 'Issued';
  deal.bondTransactions.items[0].name = '1234';

  return deal;
};
