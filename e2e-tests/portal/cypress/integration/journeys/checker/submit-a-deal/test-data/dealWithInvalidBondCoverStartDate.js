const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return date;
  };

  const invalidCoverStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date;
  };

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.bondTransactions.items[0].requestedCoverStartDate = invalidCoverStartDate().valueOf();

  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-day'] = aMonthInTheFuture().getDate();
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-month'] = aMonthInTheFuture().getMonth() + 1;
  dealWithBadCoverStartDate.bondTransactions.items[0]['coverEndDate-year'] = aMonthInTheFuture().getFullYear();
  dealWithBadCoverStartDate.bondTransactions.items[0].facilityStage = 'Issued';

  return dealWithBadCoverStartDate;
};
