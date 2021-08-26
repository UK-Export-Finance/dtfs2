const isIssued = require('./is-issued');
const CONSTANTS = require('../../../constants');

const getForecastPercentage = (facilityStage) => (
  isIssued(facilityStage)
    ? CONSTANTS.FACILITY.FORECAST_PERCENTAGE.ISSUED
    : CONSTANTS.FACILITY.FORECAST_PERCENTAGE.UNISSUED
);

module.exports = getForecastPercentage;
