const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const { nowPlusMonths, nowPlusDays } = require('../../../../../support/utils/dateFuncs');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);

  const invalidCoverStartDate = nowPlusDays(-1).valueOf();

  const dealWithBadCoverStartDate = { ...dealReadyToSubmitForReview() };

  dealWithBadCoverStartDate.mockFacilities[0].requestedCoverStartDate = invalidCoverStartDate;

  dealWithBadCoverStartDate.mockFacilities[0]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  dealWithBadCoverStartDate.mockFacilities[0]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  dealWithBadCoverStartDate.mockFacilities[0]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  dealWithBadCoverStartDate.mockFacilities[0].facilityStage = 'Issued';

  return dealWithBadCoverStartDate;
};
