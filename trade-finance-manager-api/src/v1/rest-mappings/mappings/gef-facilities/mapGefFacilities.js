const facilityMapper = require('../../facility');

const mapGefFacilities = (dealSnapshot, dealTfm) => {
  const { facilities } = dealSnapshot;

  // Map facilities if only they exists
  if (facilities?.length) {
    return facilities.map((facility) => facilityMapper(facility, dealSnapshot, dealTfm));
  }

  return null;
};

module.exports = mapGefFacilities;
