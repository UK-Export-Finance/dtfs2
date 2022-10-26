const { nowPlusDays, nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);
  const invalidCoverStartDate = nowPlusDays(-1).valueOf();

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.loanTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  dealWithBadCoverStartDate.loanTransactions.items[0].facilityStage = 'Unconditional';
  dealWithBadCoverStartDate.loanTransactions.items[0].hasBeenIssued = true;

  return dealWithBadCoverStartDate;
};
