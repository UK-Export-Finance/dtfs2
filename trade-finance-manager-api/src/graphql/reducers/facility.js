const mapFacility = require('./mappings/facilities/mapFacility');

const facilityReducer = (facility, dealDetails) => (
  {
    _id: facility._id, // eslint-disable-line no-underscore-dangle
    facilitySnapshot: mapFacility(facility.facilitySnapshot, dealDetails),
    tfm: facility.tfm,
  }
);

module.exports = facilityReducer;
