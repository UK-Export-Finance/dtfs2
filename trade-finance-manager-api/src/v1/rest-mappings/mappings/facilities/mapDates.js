const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenor = require('./mapTenor');

const mapDates = (facility, facilitySnapshot, facilityTfm, dealDetails) => {
  const dates = {};

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealDetails;

  dates.inclusionNoticeReceived = manualInclusionNoticeSubmissionDate || dealSubmissionDate;
  dates.bankIssueNoticeReceived = facilitySnapshot?.submittedAsIssuedDate;
  dates.coverStartDate = facilitySnapshot?.requestedCoverStartDate;
  dates.coverEndDate = mapCoverEndDate(
    facilitySnapshot['coverEndDate-day'],
    facilitySnapshot['coverEndDate-month'],
    facilitySnapshot['coverEndDate-year'],
    facility,
  );

  dates.isUsingFacilityEndDate = facilitySnapshot?.isUsingFacilityEndDate;
  if (facilitySnapshot?.isUsingFacilityEndDate) {
    dates.facilityEndDate = facilitySnapshot?.facilityEndDate;
  }

  if (facilitySnapshot?.isUsingFacilityEndDate === false) {
    dates.bankReviewDate = facilitySnapshot?.bankReviewDate;
  }

  dates.tenor = mapTenor(facilitySnapshot, facilityTfm, facility);

  return dates;
};

module.exports = mapDates;
