const CONSTANTS = require('../../constants');

/**
 * Ascertain facility issuance stage in ACBS is `06`
 * @param {string} code Facility stage code in ACBS
 * @returns {boolean} True if facility stage code in ACBS is `06`, false otherwise
 */
const isUnissuedInACBS = (code) => code === CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.COMMITMENT;

module.exports = isUnissuedInACBS;
