const facilityMapper = require('../../facility');

/**
 * Maps facilities from the database associated with a deal to their corresponding facility objects for use in TFM-UI and TFM-API.
 * This returns facility objects that represents current facility states with all changes applied e.g. when amendments are added in TFM
 * @param {import('@ukef/dtfs2-common').TfmFacility[]} facilities the full facility objects from the database
 * @param {import('@ukef/dtfs2-common').Deal} dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @param {import('@ukef/dtfs2-common').TfmDeal.tfm} dealTfm the deal.tfm object from the database corresponding to the facility
 * @returns mapped facility objects
 */
const mapFacilities = (facilities, dealSnapshot, dealTfm) => {
  // Map facilities if only they exists
  if (facilities?.length) {
    return facilities.map((facility) => facilityMapper(facility, dealSnapshot, dealTfm));
  }

  return null;
};

module.exports = mapFacilities;
