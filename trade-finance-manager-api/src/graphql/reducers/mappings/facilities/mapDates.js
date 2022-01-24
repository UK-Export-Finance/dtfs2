const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenorDate = require('./mapTenorDate');

const mapDates = (facility, facilityTfm, dealDetails) => {
  const dates = {};

  const {
    facilityStage,
    ukefGuaranteeInMonths,
  } = facility;

  const { exposurePeriodInMonths } = facilityTfm;

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealDetails;

  dates.inclusionNoticeReceived = manualInclusionNoticeSubmissionDate || dealSubmissionDate;
  dates.bankIssueNoticeReceived = facility.submittedAsIssuedDate;
  dates.coverStartDate = facility.requestedCoverStartDate;
  dates.coverEndDate = mapCoverEndDate(
    facility['coverEndDate-day'],
    facility['coverEndDate-month'],
    facility['coverEndDate-year'],
  );

  dates.tenor = mapTenorDate(
    facilityStage,
    ukefGuaranteeInMonths,
    exposurePeriodInMonths,
  );

  return dates;
};

module.exports = mapDates;
