const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = (dealSnapshot) => {
  const { facilities } = dealSnapshot;

  return facilities.map((f) =>
    mapGefFacility(f, dealSnapshot));
};

module.exports = mapGefFacilities;
