const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = (dealSnapshot, dealTfm) => {
  const { facilities } = dealSnapshot;

  return facilities.map((facility) =>
    mapGefFacility(facility, dealSnapshot, dealTfm));
};

module.exports = mapGefFacilities;
