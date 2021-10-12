const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const { nowPlusMonths, nowPlusDays } = require('../../../../../support/utils/dateFuncs');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);

  const invalidCoverStartDate = nowPlusDays(-1).valueOf();

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.bondTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture.getDate();
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture.getMonth() + 1;
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture.getFullYear();
  dealWithBadCoverStartDate.bondTransactions.items[0].facilityStage = 'Issued';

  return dealWithBadCoverStartDate;
};
