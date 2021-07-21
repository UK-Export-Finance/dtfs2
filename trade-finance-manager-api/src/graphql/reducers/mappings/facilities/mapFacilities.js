const mapFacility = require('./mapFacility');
const mapFacilityTfm = require('./mapFacilityTfm');

const mapFacilities = (facilities, dealDetails, dealTfm) =>
  facilities.map((f) => ({
    _id: f._id, // eslint-disable-line no-underscore-dangle
    facilitySnapshot: mapFacility(f.facilitySnapshot, f.tfm, dealDetails),
    tfm: mapFacilityTfm(f.tfm, dealTfm),
  }));

module.exports = mapFacilities;
