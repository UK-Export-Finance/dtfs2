const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const dateConstants = require('../../../../../../../e2e-fixtures/dateConstants');

module.exports = () => {
  const invalidCoverStartDate = `${dateConstants.yesterdayUnix}000`;

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.bondTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-day'] = (dateConstants.oneMonthDay).toString();
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-month'] = (dateConstants.oneMonthMonth).toString();
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-year'] = (dateConstants.oneMonthYear).toString();
  dealWithBadCoverStartDate.bondTransactions.items[0].facilityStage = 'Issued';

  return dealWithBadCoverStartDate;
};
