const facilityMapper = require('../../facility');

/**
 * Maps all the facilities from the database associated with a deal to their corresponding facility objects for use in TFM.
 * In particular, these are live facility objects that update e.g. when amendments are added in TFM.
 * This function is only used on BSS/EWCS facilities.
 * @param facilities the full facility objects from the database
 * @param dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @param dealTfm the deal.tfm object from the database corresponding to the facility
 * @returns mapped facility objects for use in TFM
 */
const mapFacilities = (facilities, dealSnapshot, dealTfm) => {
  // Map facilities if only they exists
  if (facilities?.length) {
    return facilities.map((facility) => facilityMapper(facility, dealSnapshot, dealTfm));
  }

  return null;
};

module.exports = mapFacilities;
