const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = async (dealSnapshot, dealTfm) => {
  const { facilities } = dealSnapshot;

  const mappedFacilities = await Promise.all(facilities.map(async (facility) =>
    // eslint-disable-next-line no-return-await
    await mapGefFacility(facility, dealSnapshot, dealTfm)));

  return mappedFacilities;
};

module.exports = mapGefFacilities;
