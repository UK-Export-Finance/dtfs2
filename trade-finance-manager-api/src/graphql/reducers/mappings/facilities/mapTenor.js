const mapTenorDate = require('./mapTenorDate');
const { findLatestCompletedAmendment } = require('../../../helpers/amendment.helpers');

// maps tenor from new amendment coverEndDate or from original facility
const mapTenor = (facilitySnapshot, facilityTfm, facility) => {
  const { facilityStage, ukefGuaranteeInMonths: monthsOfCover } = facilitySnapshot;
  const { exposurePeriodInMonths } = facilityTfm;

  // sets original exposure period from facility
  let updatedExposurePeriodInMonths = exposurePeriodInMonths;
  // if amendments
  if (facility?.amendments?.length > 0) {
    const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

    // checks if exposure period in months in latest completed amendment
    if (latestAmendmentTFM?.amendmentExposurePeriodInMonths) {
      // sets updatedExposurePeriodInMonths as amendment exposure period
      updatedExposurePeriodInMonths = latestAmendmentTFM.amendmentExposurePeriodInMonths;
    }
  }

  return mapTenorDate(facilityStage, monthsOfCover, updatedExposurePeriodInMonths);
};

module.exports = mapTenor;
