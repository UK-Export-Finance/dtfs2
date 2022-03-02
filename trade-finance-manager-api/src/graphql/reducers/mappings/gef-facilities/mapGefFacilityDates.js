const moment = require('moment');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenorDate = require('../facilities/mapTenorDate');
const { convertDateToTimestamp } = require('../../../../utils/date');

const mapGefFacilityDates = (facilitySnapsot, facilityTfm, dealSnapshot) => {
  const {
    coverStartDate,
    coverEndDate,
    submittedAsIssuedDate,
    monthsOfCover: ukefGuaranteeInMonths,
    facilityStage,
  } = facilitySnapsot;

  const { exposurePeriodInMonths } = facilityTfm;

  const { submissionDate: dealSubmissionDate, manualInclusionNoticeSubmissionDate } = dealSnapshot;

  const mapped = {
    inclusionNoticeReceived: manualInclusionNoticeSubmissionDate || dealSubmissionDate,
    bankIssueNoticeReceived: submittedAsIssuedDate,
    coverStartDate: convertDateToTimestamp(coverStartDate),
    tenor: mapTenorDate(
      facilityStage,
      ukefGuaranteeInMonths,
      exposurePeriodInMonths,
    ),
  };
  // only set coverEndDate if not null, else is undefined
  if (coverEndDate) {
    mapped.coverEndDate = mapCoverEndDate(
      moment(coverEndDate).format('DD'),
      moment(coverEndDate).format('MM'),
      moment(coverEndDate).format('YYYY'),
    );
  }

  return mapped;
};

module.exports = mapGefFacilityDates;
