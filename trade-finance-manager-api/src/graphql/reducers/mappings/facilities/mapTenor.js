const mapTenorDate = require('./mapTenorDate');
const { findLatestCompletedAmendment } = require('../../../helpers/amendment.helpers');

// maps tenor from new amendment coverEndDate or from original facility
const mapTenor = (facilitySnapshot, facilityTfm, facility) => {
  // Facility stage
  const { hasBeenIssued } = facilitySnapshot;
  /**
   * `monthsOfCover`: GEF
   * `ukefGuaranteeInMonths`: BSS/EWCS
   */
  const months = facilitySnapshot.ukefGuaranteeInMonths ?? facilitySnapshot.monthsOfCover;
  // If issued
  const { exposurePeriodInMonths } = facilityTfm;
  let exposurePeriod = exposurePeriodInMonths;

  // if amendments
  if (facility?.amendments?.length) {
    const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

    // checks if exposure period in months in latest completed amendment
    if (latestAmendmentTFM?.amendmentExposurePeriodInMonths) {
      // sets updatedExposurePeriodInMonths as amendment exposure period
      exposurePeriod = latestAmendmentTFM.amendmentExposurePeriodInMonths;
    }
  }

  return mapTenorDate(hasBeenIssued, months, exposurePeriod);
};

module.exports = mapTenor;
