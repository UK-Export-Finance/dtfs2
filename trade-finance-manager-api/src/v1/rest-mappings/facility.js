const mapFacility = require('./mappings/facilities/mapFacility');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacility = require('./mappings/gef-facilities/mapGefFacility');
const isGefFacility = require('./helpers/isGefFacility');

const facilityMapper = (facility, dealSnapshot, dealTfm) => {
  const facilityType = facility.facilitySnapshot.type;

  if (isGefFacility(facilityType)) {
    return mapGefFacility(facility, dealSnapshot, dealTfm);
  }

  const result = {
    _id: facility._id,
    facilitySnapshot: mapFacility(facility, dealSnapshot),
    tfm: mapFacilityTfm(facility.tfm, dealTfm, facility),
  };

  return result;
};

module.exports = facilityMapper;
