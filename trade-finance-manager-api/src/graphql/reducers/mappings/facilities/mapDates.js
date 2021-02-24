const CONSTANTS = require('../../../../constants');
const mapCoverEndDate = require('./mapCoverEndDate');

const mapDates = (facility, dealDetails) => {
  const dates = {};
  const { facilityStage } = facility;

  const dealSubmissionDate = dealDetails.submissionDate;

  dates.inclusionNoticeReceived = dealSubmissionDate;
  dates.bankIssueNoticeReceived = facility.issuedFacilitySubmittedToUkefTimestamp;
  dates.coverStartDate = facility.requestedCoverStartDate;
  dates.coverEndDate = mapCoverEndDate(facility);

  if (facilityStage === CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT) {
    dates.tenor = `${facility.ukefGuaranteeInMonths} months`;
  }

  return dates;
};

module.exports = mapDates;
