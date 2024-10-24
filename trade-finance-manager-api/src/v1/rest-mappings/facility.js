const mapFacilitySnapshot = require('./mappings/facilities/mapFacilitySnapshot');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacilitySnapshot = require('./mappings/gef-facilities/mapGefFacilitySnapshot');
const isGefFacility = require('./helpers/isGefFacility');

/**
 * Maps the facility object from the database to a dynamically updating facility object used across TFM.
 * This facility object updates e.g. when amendments are added in TFM.
 * @param facility the full facility object from the database
 * @param dealSnapshot the deal.dealSnapshot object from the database corresponding to the facility
 * @param dealTfm the deal.dealTfm object from the database corresponding to the facility
 * @returns mapped facility object for use in TFM
 */
const facilityMapper = (facility, dealSnapshot, dealTfm) => {
  const facilityType = facility.facilitySnapshot.type;
  const isGef = isGefFacility(facilityType);

  const mappedFacilitySnapshot = isGef ? mapGefFacilitySnapshot(facility, dealSnapshot) : mapFacilitySnapshot(facility, dealSnapshot);

  return {
    _id: facility._id,
    facilitySnapshot: mappedFacilitySnapshot,
    tfm: mapFacilityTfm(facility.tfm, dealTfm, facility),
  };
};

module.exports = facilityMapper;
