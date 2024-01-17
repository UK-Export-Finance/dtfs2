const isIssued = require('./is-issued');
const CONSTANTS = require('../../../constants');

const getForecastPercentage = (facility, dealType) => {
  if (dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
    return facility.hasBeenIssued ? CONSTANTS.FACILITY.FORECAST_PERCENTAGE.ISSUED : CONSTANTS.FACILITY.FORECAST_PERCENTAGE.UNISSUED;
  }

  return isIssued(facility.facilityStage) ? CONSTANTS.FACILITY.FORECAST_PERCENTAGE.ISSUED : CONSTANTS.FACILITY.FORECAST_PERCENTAGE.UNISSUED;
};

module.exports = getForecastPercentage;
