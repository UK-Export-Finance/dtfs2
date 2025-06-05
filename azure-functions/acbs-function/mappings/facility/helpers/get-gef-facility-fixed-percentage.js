const dotenv = require('dotenv');
const { FACILITY_TYPE, FACILITY_UTILISATION_PERCENTAGE } = require('../../../constants/facility');

dotenv.config();

const { CASH, CONTINGENT } = FACILITY_TYPE;
const { CASH_UTILISATION_PERCENTAGE, CONTINGENT_UTILISATION_PERCENTAGE } = process.env;

/**
 * Returns the utilisation percentage for a GEF facility based on its type.
 *
 * @param {string} type - The type of the facility (e.g., CASH, CONTINGENT).
 * @returns {number} The utilisation percentage for the specified facility type.
 */
const getGefFacilityPercentage = (type) => {
  switch (type) {
    case CASH:
      return CASH_UTILISATION_PERCENTAGE ? Number(CASH_UTILISATION_PERCENTAGE) : FACILITY_UTILISATION_PERCENTAGE.CASH;
    case CONTINGENT:
      return CONTINGENT_UTILISATION_PERCENTAGE ? Number(CONTINGENT_UTILISATION_PERCENTAGE) : FACILITY_UTILISATION_PERCENTAGE.CONTINGENT;
    default:
      return FACILITY_UTILISATION_PERCENTAGE.DEFAULT;
  }
};

module.exports = getGefFacilityPercentage;
