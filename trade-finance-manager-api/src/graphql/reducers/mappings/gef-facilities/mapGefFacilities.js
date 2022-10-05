const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = (dealSnapshot, dealTfm) => {
  const { facilities } = dealSnapshot;

  const mappedFacilities = facilities.map((facility) =>
    mapGefFacility(facility, dealSnapshot, dealTfm));

  return mappedFacilities;
};

module.exports = mapGefFacilities;
