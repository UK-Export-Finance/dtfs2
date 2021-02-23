const mapFacility = require('./mapFacility');

const mapFacilities = (facilities, dealDetails) => {
  const mappedFacilities = [];

  facilities.forEach((f) => {
    mappedFacilities.push(mapFacility(f, dealDetails));
  });

  return mappedFacilities;
};

module.exports = mapFacilities;
