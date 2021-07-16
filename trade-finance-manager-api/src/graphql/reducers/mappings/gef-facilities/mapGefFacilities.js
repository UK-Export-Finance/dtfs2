const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = (facilities, dealSnapshot) => {
  const mappedFacilities = [];

  facilities.forEach((f) => {
    mappedFacilities.push(mapGefFacility(f, dealSnapshot));
  });

  return mappedFacilities;
};

module.exports = mapGefFacilities;
