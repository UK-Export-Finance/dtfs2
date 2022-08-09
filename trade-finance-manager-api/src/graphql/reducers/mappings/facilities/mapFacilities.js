const mapFacility = require('./mapFacility');
const mapFacilityTfm = require('./mapFacilityTfm');

const mapFacilities = async (facilities, dealDetails, dealTfm) => {
  const mappedFacility = await Promise.all(facilities.map(async (f) => ({
    _id: f._id,
    facilitySnapshot: await mapFacility(f.facilitySnapshot, f.tfm, dealDetails, f),
    tfm: await mapFacilityTfm(f.tfm, dealTfm, f),
  })));

  return mappedFacility;
};

module.exports = mapFacilities;
