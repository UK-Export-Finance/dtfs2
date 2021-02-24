const mapFacility = require('./mappings/facilities/mapFacility');

const facilityReducer = (facility, dealDetails) =>
  mapFacility(facility, dealDetails);

module.exports = facilityReducer;
