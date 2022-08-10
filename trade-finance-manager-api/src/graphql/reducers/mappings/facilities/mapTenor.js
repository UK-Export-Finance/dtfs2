const api = require('../../../../v1/api');
const mapTenorDate = require('./mapTenorDate');
const { calculateAmendmentTenor } = require('../../../helpers/amendment.helpers');

// maps tenor from new amendment coverEndDate or from original facility
const mapTenor = async (facilitySnapshot, facilityTfm) => {
  const { facilityStage, ukefGuaranteeInMonths: monthsOfCover } = facilitySnapshot;
  const { exposurePeriodInMonths } = facilityTfm;

  // sets original exposure period from facility
  let updatedExposurePeriodInMonths = exposurePeriodInMonths;

  if (facilitySnapshot?._id) {
    const { _id } = facilitySnapshot;
    const latestCompletedAmendmentCoverEndDate = await api.getLatestCompletedDateAmendment(_id);
    if (latestCompletedAmendmentCoverEndDate?.coverEndDate) {
      // if amendment coverEndDate change, then calculates new tenor period
      updatedExposurePeriodInMonths = await calculateAmendmentTenor(facilitySnapshot, latestCompletedAmendmentCoverEndDate);
    }
  }

  return mapTenorDate(facilityStage, monthsOfCover, updatedExposurePeriodInMonths);
};

module.exports = mapTenor;
