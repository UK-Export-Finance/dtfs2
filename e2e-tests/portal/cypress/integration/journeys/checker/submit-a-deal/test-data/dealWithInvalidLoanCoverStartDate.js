const { nowPlusDays, nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);
  const invalidCoverStartDate = nowPlusDays(-1).valueOf();

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.loanTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture.getDate();
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture.getMonth() + 1;
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture.getFullYear();
  dealWithBadCoverStartDate.loanTransactions.items[0].facilityStage = 'Unconditional';

  return dealWithBadCoverStartDate;
};
