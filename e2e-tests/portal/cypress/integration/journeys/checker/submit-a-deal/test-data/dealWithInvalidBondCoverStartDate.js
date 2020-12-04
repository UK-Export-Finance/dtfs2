const moment = require('moment');
const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = moment().add(1, 'month');
  const invalidCoverStartDate = moment().subtract(1, 'day').utc().valueOf();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const dealWithBadCoverStartDate = JSON.parse(JSON.stringify(dealReadyToSubmitForReview()));

  dealWithBadCoverStartDate.bondTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-day'] = moment(aMonthInTheFuture).format('DD');
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-month'] = moment(aMonthInTheFuture).format('MM');
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-year'] = moment(aMonthInTheFuture).format('YYYY');
  dealWithBadCoverStartDate.bondTransactions.items[0].facilityStage = 'Issued';

  return dealWithBadCoverStartDate
}
