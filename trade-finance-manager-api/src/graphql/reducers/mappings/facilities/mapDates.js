const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenor = require('./mapTenor');

const mapDates = async (facility, facilityTfm, dealDetails) => {
  const dates = {};

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealDetails;

  dates.inclusionNoticeReceived = manualInclusionNoticeSubmissionDate || dealSubmissionDate;
  dates.bankIssueNoticeReceived = facility.submittedAsIssuedDate;
  dates.coverStartDate = facility.requestedCoverStartDate;
  dates.coverEndDate = await mapCoverEndDate(
    facility['coverEndDate-day'],
    facility['coverEndDate-month'],
    facility['coverEndDate-year'],
    facility,
  );

  dates.tenor = await mapTenor(facility, facilityTfm);

  return dates;
};

module.exports = mapDates;
