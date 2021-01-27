const mapFacility = require('./mappings/facilities/mapFacility');

const facilityReducer = (facility) =>
  mapFacility(facility);

module.exports = facilityReducer;
