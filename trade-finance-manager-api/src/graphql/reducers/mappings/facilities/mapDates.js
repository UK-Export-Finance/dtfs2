const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenorDate = require('./mapTenorDate');


const mapDates = (facility, facilityTfm, dealDetails) => {
  const dates = {};

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealDetails;

  dates.inclusionNoticeReceived = manualInclusionNoticeSubmissionDate || dealSubmissionDate;
  dates.bankIssueNoticeReceived = facility.issuedFacilitySubmittedToUkefTimestamp;
  dates.coverStartDate = facility.requestedCoverStartDate;
  dates.coverEndDate = mapCoverEndDate(
    facility['coverEndDate-day'],
    facility['coverEndDate-month'],
    facility['coverEndDate-year'],
  );

  dates.tenor = mapTenorDate(facility, facilityTfm);

  return dates;
};

module.exports = mapDates;
