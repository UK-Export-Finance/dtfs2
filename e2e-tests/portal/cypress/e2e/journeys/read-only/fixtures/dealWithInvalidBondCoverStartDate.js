const { oneMonth, yesterday } = require('@ukef/dtfs2-common/test-helpers');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const invalidCoverStartDate = yesterday.unixMillisecondsString; // TODO: Standardise this coding style

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.bondTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-day'] = oneMonth.day;
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-month'] = oneMonth.month;
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-year'] = oneMonth.year;
  dealWithBadCoverStartDate.bondTransactions.items[0].facilityStage = 'Issued';

  return dealWithBadCoverStartDate;
};
