const mapFacility = require('./mappings/facilities/mapFacility');
const mapFacilityTfm = require('./mappings/facilities/mapFacilityTfm');
const mapGefFacility = require('./mappings/facilities/mapGefFacility');
const isGefFacility = require('./helpers/isGefFacility');

const facilityReducer = (facility, dealSnapshot, dealTfm) => {
  const { facilitySnapshot } = facility;

  if (isGefFacility(facilitySnapshot.type)) {
    return mapGefFacility(facility, dealSnapshot);
  }

  const result = {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    facilitySnapshot: mapFacility(
      facilitySnapshot,
      facility.tfm,
      dealSnapshot.details,
    ),
    tfm: mapFacilityTfm(facility.tfm, dealTfm),
  };

  return result;
};

module.exports = facilityReducer;
