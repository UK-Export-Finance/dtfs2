const facilityMapper = require('../../facility');

const mapFacilities = (facilities, dealSnapshot, dealTfm) => {
  // Map facilities if only they exists
  if (facilities?.length) {
    return facilities.map((facility) => facilityMapper(facility, dealSnapshot, dealTfm));
  }

  return null;
};

module.exports = mapFacilities;
