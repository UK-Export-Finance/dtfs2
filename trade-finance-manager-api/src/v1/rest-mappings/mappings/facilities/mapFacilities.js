const mapFacilitySnapshot = require('./mapFacilitySnapshot');
const mapFacilityTfm = require('./mapFacilityTfm');

const mapFacilities = (facilities, dealDetails, dealTfm) => {
  // Map facilities if only they exists
  if (facilities?.length) {
    const mappedFacilities = facilities.map((f) => ({
      _id: f._id,
      facilitySnapshot: mapFacilitySnapshot(f.facilitySnapshot, f.tfm, dealDetails, f),
      tfm: mapFacilityTfm(f.tfm, dealTfm, f),
    }));

    return mappedFacilities;
  }

  return null;
};

module.exports = mapFacilities;
