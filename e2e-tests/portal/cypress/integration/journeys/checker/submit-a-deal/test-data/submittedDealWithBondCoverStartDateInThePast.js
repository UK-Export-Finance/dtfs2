const { nowPlusDays, nowPlusMonths } = require('../../../../../support/utils/dateFuncs');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);
  const dealSubmissionDate = nowPlusDays(-1).valueOf();
  const coverStartDateBeforeDealSubmissionDate = nowPlusDays(-7).valueOf();

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.bondTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.bondTransactions.items[0]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  deal.bondTransactions.items[0]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  deal.bondTransactions.items[0]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  deal.bondTransactions.items[0].facilityStage = 'Issued';
  deal.bondTransactions.items[0].uniqueIdentificationNumber = '1234';

  return deal;
};
