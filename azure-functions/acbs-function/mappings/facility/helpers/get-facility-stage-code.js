const isIssued = require('./is-issued');

const getFacilityStageCode = (facility) => (isIssued(facility) ? '07' : '06');

module.exports = getFacilityStageCode;
