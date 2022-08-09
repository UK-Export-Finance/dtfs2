const { formattedNumber } = require('../../../../utils/number');
const api = require('../../../../v1/api');
const { calculateNewFacilityValue, calculateUkefExposure } = require('../../../helpers/amendment.helpers');
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

      // gets the latest value, amendmentId and currency from latest completed amendment with value change
      const latestCompletedAmendmentValue = await api.getLatestCompletedValueAmendment(_id);

      // if value exists - else there is no completed amendment with value changed
      if (latestCompletedAmendmentValue?.value) {
        const { amendmentId } = latestCompletedAmendmentValue;
        const { coverPercentage, coveredPercentage } = facility.facilitySnapshot;
        // gets full amendment
        const fullAmendment = await api.getAmendmentById(_id, amendmentId);

        const { requireUkefApproval, submittedAt, bankDecision } = fullAmendment;
        // value of ukefExposureCalculationTime from automatic amendment submission time or manual amendment bankDecision submission time
        const ukefExposureTimestamp = requireUkefApproval ? bankDecision.submittedAt : submittedAt;

        // BSS is coveredPercentage while GEF is coverPercentage
        const coverPercentageValue = coverPercentage || coveredPercentage;

        const valueInGBP = calculateNewFacilityValue(exchangeRate, latestCompletedAmendmentValue);
        const ukefExposureValue = calculateUkefExposure(valueInGBP, coverPercentageValue);

        // sets new exposure value based on amendment value
        formattedUkefExposure = formattedNumber(ukefExposureValue);
        // converts from seconds unix timestamp to one with milliseconds
        ukefExposureCalculationTimestampValue = new Date(ukefExposureTimestamp * 1000).valueOf();
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
