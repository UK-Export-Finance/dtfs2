const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = (dealSnapshot, dealTfm) => {
  const { facilities } = dealSnapshot;

  // Map facilities if only they exists
  if (facilities.length) {
    const mappedFacilities = facilities.map((facility) =>
      mapGefFacility(facility, dealSnapshot, dealTfm));

    return mappedFacilities;
  }

  return null;
};

module.exports = mapGefFacilities;
