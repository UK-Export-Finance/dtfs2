const mapFacility = require('./mappings/facilities/mapFacility');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacility = require('./mappings/gef-facilities/mapGefFacility');
const isGefFacility = require('../helpers/isGefFacility');

const facilityReducer = (facility, dealSnapshot, dealTfm) => {
  const { facilitySnapshot } = facility;

  if (isGefFacility(facilitySnapshot.type)) {
    return mapGefFacility(facility, dealSnapshot, dealTfm);
  }

  const result = {
    _id: facility._id,
    facilitySnapshot: mapFacility(
      facilitySnapshot,
      facility.tfm,
      dealSnapshot.details,
      facility,
    ),
    tfm: mapFacilityTfm(facility.tfm, dealTfm, facility),
  };

  return result;
};

module.exports = facilityReducer;
