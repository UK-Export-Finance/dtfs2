const mapFacility = require('./mapFacility');
const mapFacilityTfm = require('./mapFacilityTfm');

const mapFacilities = (facilities, dealDetails, dealTfm) => {
  const mappedFacility = facilities.map((f) => ({
    _id: f._id,
    facilitySnapshot: mapFacility(f.facilitySnapshot, f.tfm, dealDetails, f),
    tfm: mapFacilityTfm(f.tfm, dealTfm, f),
  }));

  return mappedFacility;
};

module.exports = mapFacilities;
