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
    if (facility?.amendments?.length > 0) {
      const latestAmendmentTFM = findLatestCompletedAmendment(facility.amendments);

      if (latestAmendmentTFM?.exposure) {
        const { exposure, timestamp } = latestAmendmentTFM.exposure;
        // sets new exposure value based on amendment value
        formattedUkefExposure = exposure;
        // converts from seconds unix timestamp to one with milliseconds
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
