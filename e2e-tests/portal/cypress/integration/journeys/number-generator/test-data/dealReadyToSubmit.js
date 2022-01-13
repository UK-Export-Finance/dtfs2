const dealThatJustNeedsConversionDate = require('./dealThatJustNeedsConversionDate');
const { nowPlusMonths } = require('../../../../support/utils/dateFuncs');

module.exports = () => {
  const now = new Date();

  // doing a complete serialize+deserialize here...
  // ran into issues destructuring things into our new object; cypress was keeping references
  // between my bits of test data, so updating 1 deal would cause the other to update..
  const deal = { ...dealThatJustNeedsConversionDate() };

  deal.submissionDetails['supplyContractConversionDate-day'] = now.getDate();
  deal.submissionDetails['supplyContractConversionDate-month'] = now.getMonth() + 1;
  deal.submissionDetails['supplyContractConversionDate-year'] = now.getFullYear();

  const loan = deal.mockFacilities.find((f) => f.facilityType === 'Loan');
  loan.requestedCoverStartDate = now.valueOf();

  const aMonthInTheFuture = nowPlusMonths(1);
  loan['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  loan['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  loan['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  return deal;
};
