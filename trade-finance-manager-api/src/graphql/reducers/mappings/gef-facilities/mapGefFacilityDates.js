const moment = require('moment');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenor = require('../facilities/mapTenor');
const { convertDateToTimestamp } = require('../../../../utils/date');

const mapGefFacilityDates = (facility, facilityTfm, dealSnapshot) => {
  const {
    coverStartDate,
    coverEndDate,
    submittedAsIssuedDate,
  } = facility.facilitySnapshot;

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
    mapped.coverEndDate = mapCoverEndDate(
      moment(coverEndDate).format('DD'),
      moment(coverEndDate).format('MM'),
      moment(coverEndDate).format('YYYY'),
      facility,
    );
  }

  return mapped;
};

module.exports = mapGefFacilityDates;
