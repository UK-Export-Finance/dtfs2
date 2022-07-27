const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = async (dealSnapshot, dealTfm) => {
  const { facilities } = dealSnapshot;

  const mappedFacilities = await Promise.all(facilities.map((facility) =>
    mapGefFacility(facility, dealSnapshot, dealTfm)));

  return mappedFacilities;
};

module.exports = mapGefFacilities;
