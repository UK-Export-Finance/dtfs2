const mapFacility = require('./mapFacility');

const mapFacilities = (facilities) => {
  const mappedFacilities = [];

  facilities.forEach((f) => {
    mappedFacilities.push(mapFacility(f));
  });

  return mappedFacilities;
};

module.exports = mapFacilities;
