const isIssued = require('./is-issued');
const CONSTANTS = require('../../../constants');

const getFacilityStageCode = (facility) => (
  isIssued(facility)
    ? CONSTANTS.FACILITY.STAGE_CODE.ISSUED
    : CONSTANTS.FACILITY.STAGE_CODE.UNISSUED
);

module.exports = getFacilityStageCode;
