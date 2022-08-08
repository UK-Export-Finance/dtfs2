const { fromUnixTime } = require('date-fns');
const { formattedNumber } = require('../../../../utils/number');
const api = require('../../../../v1/api');
const { calculateNewFacilityValue, calculateUkefExposure, isValidCompletedValueAmendment } = require('../../../helpers/amendment.helpers');
const { CURRENCY } = require('../../../../constants/currency.constant');

// maps ukef exposure on original value or latest amended value
const mapUkefExposure = async (facilityTfm, facility) => {
  if (facilityTfm) {
    const {
      ukefExposure,
      ukefExposureCalculationTimestamp,
      exchangeRate,
    } = facilityTfm;

    // sets facility exposure values and timestamp
    let formattedUkefExposure = formattedNumber(ukefExposure);
    let ukefExposureCalculationTimestampValue = ukefExposureCalculationTimestamp;

    if (facility?._id) {
      const { _id } = facility;

      const latestCompletedAmendment = await api.getLatestCompletedAmendment(_id);

      if (isValidCompletedValueAmendment(latestCompletedAmendment)) {
        const { coverPercentage, coveredPercentage } = facility.facilitySnapshot;
        const { requireUkefApproval, submittedAt, bankDecision } = latestCompletedAmendment;
        // value of ukefExposureCalculationTime from automatic amendment submission time or manual amendment bankDecision submission time
        const ukefExposureCalculationTime = requireUkefApproval ? bankDecision.submittedAt : submittedAt;

        // BSS is coveredPercentage while GEF is coverPercentage
        const coverPercentageValue = coverPercentage || coveredPercentage;

        const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendment);
        const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

        // sets new exposure value based on amendment value
        formattedUkefExposure = formattedNumber(ukefExposureValue);
        // converts from seconds unix timestamp to one with milliseconds
        ukefExposureCalculationTimestampValue = fromUnixTime(ukefExposureCalculationTime).valueOf();
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
