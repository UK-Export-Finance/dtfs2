const CONSTANTS = require('../../constants');

/**
 * Ascertain facility issuance stage in ACBS
 * @param {String} code Facility stage code in ACBS
 * @returns {Boolean} True if facility stage code in ACBS is `07`, false otherwise
 */
const isIssuedInACBS = (code) => code === CONSTANTS.FACILITIES.ACBS_FACILITY_STAGE.ISSUED;

module.exports = isIssuedInACBS;
