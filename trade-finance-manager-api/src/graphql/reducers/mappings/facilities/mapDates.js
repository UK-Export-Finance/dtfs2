const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenorDate = require('./mapTenorDate');


const mapDates = (facility, facilityTfm, dealDetails) => {
  const dates = {};

  const dealSubmissionDate = dealDetails.submissionDate;

  dates.inclusionNoticeReceived = dealSubmissionDate;
  dates.bankIssueNoticeReceived = facility.issuedFacilitySubmittedToUkefTimestamp;
  dates.coverStartDate = facility.requestedCoverStartDate;
  dates.coverEndDate = mapCoverEndDate(facility);

  dates.tenor = mapTenorDate(facility, facilityTfm);

  return dates;
};

module.exports = mapDates;
