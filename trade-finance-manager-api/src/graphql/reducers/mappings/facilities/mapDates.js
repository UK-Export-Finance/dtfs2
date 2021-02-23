const mapCoverEndDate = require('./mapCoverEndDate');

const mapDates = (facility, dealDetails) => {
  const dates = {};

  const dealSubmissionDate = dealDetails.submissionDate;

  dates.inclusionNoticeReceived = dealSubmissionDate;
  dates.bankIssueNoticeReceived = facility.issuedDate;
  dates.coverStartDate = facility.requestedCoverStartDate;
  dates.coverEndDate = mapCoverEndDate(facility);

  return dates;
};

module.exports = mapDates;
