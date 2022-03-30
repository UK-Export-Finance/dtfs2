const { nowPlusDays, nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

const dealReadyToSubmitForReview = require('./dealReadyToSubmit');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);
  const invalidCoverStartDate = nowPlusDays(-1).valueOf();

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.mockFacilities[1].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.mockFacilities[1]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  dealWithBadCoverStartDate.mockFacilities[1]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  dealWithBadCoverStartDate.mockFacilities[1]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  dealWithBadCoverStartDate.mockFacilities[1].facilityStage = 'Unconditional';
  dealWithBadCoverStartDate.mockFacilities[1].hasBeenIssued = true;

  return dealWithBadCoverStartDate;
};
