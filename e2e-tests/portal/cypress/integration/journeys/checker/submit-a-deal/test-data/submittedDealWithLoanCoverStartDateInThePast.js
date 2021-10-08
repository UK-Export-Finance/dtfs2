const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const { nowPlusDays, nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);
  const dealSubmissionDate = nowPlusDays(-1).valueOf();
  const coverStartDateBeforeDealSubmissionDate = nowPlusDays(-7).valueOf();

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.loanTransactions.items[0].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.loanTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture.getDate();
  deal.loanTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture.getMonth() + 1;
  deal.loanTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture.getFullYear();
  deal.loanTransactions.items[0].facilityStage = 'Unconditional';

  return deal;
};
