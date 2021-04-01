const isIssued = require('./is-issued');

const getForecastPercentage = (facility) => (isIssued(facility) ? 100 : 75);

module.exports = getForecastPercentage;
