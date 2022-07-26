const api = require('../../../../v1/api');
const mapTenorDate = require('./mapTenorDate');
const { calculateAmendmentTenor, isValidCompletedCoverEndDateAmendment } = require('../../../helpers/amendment.helpers');

// maps tenor from new amendment coverEndDate or from original facility
const mapTenor = async (facilitySnapshot, facilityTfm) => {
  const { facilityStage, monthsOfCover: ukefGuaranteeInMonths } = facilitySnapshot;
  const { exposurePeriodInMonths } = facilityTfm;

  // sets original exposure period from facility
  let updatedExposurePeriodInMonths = exposurePeriodInMonths;

  if (facilitySnapshot?._id) {
    const { _id } = facilitySnapshot;
    const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);
    if (isValidCompletedCoverEndDateAmendment(latestCompletedAmendment)) {
      // if amendment coverEndDate change, then calculates new tenor period
      updatedExposurePeriodInMonths = await calculateAmendmentTenor(facilitySnapshot, latestCompletedAmendment);
    }
  }

  return mapTenorDate(facilityStage, ukefGuaranteeInMonths, updatedExposurePeriodInMonths);
};

module.exports = mapTenor;
