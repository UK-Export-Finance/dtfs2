const mapFacilitySnapshot = require('./mapFacilitySnapshot');
const mapFacilityTfm = require('./mapFacilityTfm');

const mapFacilities = (facilities, dealDetails, dealTfm) => {
  // Map facilities if only they exists
  if (facilities?.length) {
    const mappedFacilities = facilities.map((facility) => ({
      _id: facility._id,
      facilitySnapshot: mapFacilitySnapshot(facility, dealDetails),
      tfm: mapFacilityTfm(facility.tfm, dealTfm, facility),
    }));

    return mappedFacilities;
  }

  return null;
};

module.exports = mapFacilities;
