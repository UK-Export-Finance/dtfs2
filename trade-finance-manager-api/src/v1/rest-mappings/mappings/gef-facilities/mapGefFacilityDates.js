const { format } = require('date-fns');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenor = require('../facilities/mapTenor');
const { convertDateToTimestamp } = require('../../../../utils/date');

const mapGefFacilityDates = (facility, facilityTfm, dealSnapshot) => {
  const { coverStartDate, coverEndDate, submittedAsIssuedDate, isUsingFacilityEndDate, facilityEndDate, bankReviewDate } = facility.facilitySnapshot;

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealSnapshot;

  const mapped = {
    inclusionNoticeReceived: manualInclusionNoticeSubmissionDate || dealSubmissionDate,
    bankIssueNoticeReceived: submittedAsIssuedDate,
    tenor: mapTenor(facility.facilitySnapshot, facilityTfm, facility),
  };

  if (coverStartDate) {
    mapped.coverStartDate = convertDateToTimestamp(coverStartDate);
  }

  // only set coverEndDate if not null, else is undefined
  if (coverEndDate) {
    const date = new Date(coverEndDate);

    mapped.coverEndDate = mapCoverEndDate(format(date, 'dd'), format(date, 'MM'), format(date, 'yyyy'), facility);
  }

  mapped.isUsingFacilityEndDate = isUsingFacilityEndDate;

  if (isUsingFacilityEndDate) {
    mapped.facilityEndDate = convertDateToTimestamp(facilityEndDate);
  }

  if (isUsingFacilityEndDate === false) {
    mapped.bankReviewDate = convertDateToTimestamp(bankReviewDate);
  }

  return mapped;
};

module.exports = mapGefFacilityDates;
