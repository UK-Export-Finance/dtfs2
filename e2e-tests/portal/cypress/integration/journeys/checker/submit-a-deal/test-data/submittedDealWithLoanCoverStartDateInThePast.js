const dealReadyToSubmitForReview = require('./dealReadyToSubmit');
const { nowPlusDays, nowPlusMonths } = require('../../../../../support/utils/dateFuncs');

module.exports = () => {
  const aMonthInTheFuture = nowPlusMonths(1);
  const dealSubmissionDate = nowPlusDays(-1).valueOf();
  const coverStartDateBeforeDealSubmissionDate = nowPlusDays(-7).valueOf();

  const deal = { ...dealReadyToSubmitForReview() };

  deal.details.submissionDate = dealSubmissionDate;

  deal.mockFacilities[1].requestedCoverStartDate = coverStartDateBeforeDealSubmissionDate;

  deal.mockFacilities[1]['coverEndDate-day'] = (aMonthInTheFuture.getDate()).toString();
  deal.mockFacilities[1]['coverEndDate-month'] = (aMonthInTheFuture.getMonth() + 1).toString();
  deal.mockFacilities[1]['coverEndDate-year'] = (aMonthInTheFuture.getFullYear()).toString();
  deal.mockFacilities[1].facilityStage = 'Unconditional';
  deal.mockFacilities[1].hasBeenIssued = true;

  return deal;
};
