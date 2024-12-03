const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const { yesterday, oneMonth } = require('../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const invalidCoverStartDate = yesterday.unixMillisecondsString; // TODO: Standardise this coding style

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.loanTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-day'] = oneMonth.day;
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-month'] = oneMonth.month;
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-year'] = oneMonth.year;
  dealWithBadCoverStartDate.loanTransactions.items[0].facilityStage = 'Unconditional';
  dealWithBadCoverStartDate.loanTransactions.items[0].hasBeenIssued = true;

  return dealWithBadCoverStartDate;
};
