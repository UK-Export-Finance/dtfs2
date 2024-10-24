const mapFacilitySnapshot = require('./mappings/facilities/mapFacilitySnapshot');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacilitySnapshot = require('./mappings/gef-facilities/mapGefFacilitySnapshot');
const isGefFacility = require('./helpers/isGefFacility');

const facilityMapper = (facility, dealSnapshot, dealTfm) => {
  const facilityType = facility.facilitySnapshot.type;
  const isGef = isGefFacility(facilityType);

  const mappedFacilitySnapshot = isGef ? mapGefFacilitySnapshot(facility, dealSnapshot) : mapFacilitySnapshot(facility, dealSnapshot.details);

  return {
    _id: facility._id,
    facilitySnapshot: mappedFacilitySnapshot,
    tfm: mapFacilityTfm(facility.tfm, dealTfm, facility),
  };
};

module.exports = facilityMapper;
