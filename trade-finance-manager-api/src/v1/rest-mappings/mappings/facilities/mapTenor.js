const mapTenorDate = require('./mapTenorDate');
const { findLatestCompletedAmendment } = require('../../helpers/amendment.helpers');

// maps tenor from new amendment coverEndDate or from original facility
const mapTenor = (facilitySnapshot, facilityTfm, facility) => {
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
    const { amendmentExposurePeriodInMonths } = findLatestCompletedAmendment(facility.amendments);

    // checks if exposure period in months is latest completed amendment
    if (amendmentExposurePeriodInMonths) {
      // sets updatedExposurePeriodInMonths as amendment exposure period
      exposurePeriod = amendmentExposurePeriodInMonths;
    }
  }

  return mapTenorDate(months, exposurePeriod);
};

module.exports = mapTenor;
