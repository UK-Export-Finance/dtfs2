const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const invalidCoverStartDate = `${dateConstants.yesterdayUnix}000`;

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.loanTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-day'] = (dateConstants.oneMonthDay).toString();
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-month'] = (dateConstants.oneMonthMonth).toString();
  dealWithBadCoverStartDate.loanTransactions.items[0]['coverEndDate-year'] = (dateConstants.oneMonthYear).toString();
  dealWithBadCoverStartDate.loanTransactions.items[0].facilityStage = 'Unconditional';
  dealWithBadCoverStartDate.loanTransactions.items[0].hasBeenIssued = true;

  return dealWithBadCoverStartDate;
};
