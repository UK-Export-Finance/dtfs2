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

  return {
    inclusionNoticeReceived: Number(manualInclusionNoticeSubmissionDate) || Number(dealSubmissionDate),
    bankIssueNoticeReceived: Number(submittedAsIssuedDate),
    coverStartDate: convertDateToTimestamp(coverStartDate),
    coverEndDate: mapCoverEndDate(
      moment(coverEndDate).format('DD'),
      moment(coverEndDate).format('MM'),
      moment(coverEndDate).format('YYYY'),
    ),
    tenor: mapTenorDate(
      facilityStage,
      ukefGuaranteeInMonths,
      exposurePeriodInMonths,
    ),
  };
};

module.exports = mapGefFacilityDates;
