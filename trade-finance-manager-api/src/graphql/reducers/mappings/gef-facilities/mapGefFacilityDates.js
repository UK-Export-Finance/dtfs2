const moment = require('moment');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenor = require('../facilities/mapTenor');
const { convertDateToTimestamp } = require('../../../../utils/date');

const mapGefFacilityDates = async (facilitySnapshot, facilityTfm, dealSnapshot) => {
  const {
    coverStartDate,
    coverEndDate,
    submittedAsIssuedDate,
  } = facilitySnapshot;

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealSnapshot;

  const mapped = {
    inclusionNoticeReceived: manualInclusionNoticeSubmissionDate || dealSubmissionDate,
    bankIssueNoticeReceived: submittedAsIssuedDate,
    tenor: await mapTenor(facilitySnapshot, facilityTfm),
  };

  if (coverStartDate) {
    mapped.coverStartDate = convertDateToTimestamp(coverStartDate);
  }

  // only set coverEndDate if not null, else is undefined
  if (coverEndDate) {
    mapped.coverEndDate = await mapCoverEndDate(
      moment(coverEndDate).format('DD'),
      moment(coverEndDate).format('MM'),
      moment(coverEndDate).format('YYYY'),
      facilitySnapshot,
    );
  }

  return mapped;
};

module.exports = mapGefFacilityDates;
