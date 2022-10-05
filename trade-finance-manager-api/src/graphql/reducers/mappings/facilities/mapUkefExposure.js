const { formattedNumber } = require('../../../../utils/number');
const { CURRENCY } = require('../../../../constants/currency.constant');
const { findLatestCompletedAmendment } = require('../../../helpers/amendment.helpers');

// maps ukef exposure on original value or latest amended value
const mapUkefExposure = (facilityTfm, facility) => {
  if (facilityTfm) {
    const {
      ukefExposure,
      ukefExposureCalculationTimestamp,
    } = facilityTfm;

    // sets facility exposure values and timestamp
    let formattedUkefExposure = formattedNumber(ukefExposure);
    let ukefExposureCalculationTimestampValue = ukefExposureCalculationTimestamp;
    // if amendment in facility
    if (facility?.amendments?.length) {
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);
      // if exposure part of latest tfm object
      if (latestAmendmentTFM?.exposure) {
        const { exposure, timestamp } = latestAmendmentTFM.exposure;
        // sets new exposure value based on amendment value
        formattedUkefExposure = exposure;
        // sets timestamp from amendment exposure timestamp
        ukefExposureCalculationTimestampValue = timestamp;
      }
    }

    return {
      exposure: `${CURRENCY.GBP} ${formattedUkefExposure}`,
      timestamp: `${ukefExposureCalculationTimestampValue}`,
    };
  }

  return {};
};

module.exports = mapUkefExposure;
