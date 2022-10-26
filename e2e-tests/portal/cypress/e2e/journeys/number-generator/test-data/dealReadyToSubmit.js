const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

module.exports = () => {
  const now = new Date();

  const deal = { ...dealThatJustNeedsConversionDate() };

  deal.submissionDetails['supplyContractConversionDate-day'] = now.getDate();
  deal.submissionDetails['supplyContractConversionDate-month'] = now.getMonth() + 1;
  deal.submissionDetails['supplyContractConversionDate-year'] = now.getFullYear();

  const loan = deal.mockFacilities.find((f) => f.type === 'Loan');
  loan.requestedCoverStartDate = now.valueOf();

  const aMonthInTheFuture = nowPlusMonths(1);
  loan['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  loan['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  loan['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  return deal;
};
