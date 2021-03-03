const mapFacility = require('./mapFacility');

const mapFacilities = (facilities, dealDetails) => {
  const mappedFacilities = [];

  facilities.forEach((f) => {
    mappedFacilities.push({
      _id: f._id, // eslint-disable-line no-underscore-dangle
      facilitySnapshot: mapFacility(f.facilitySnapshot, f.tfm, dealDetails),
      tfm: f.tfm,
    });
  });

  return mappedFacilities;
};

module.exports = mapFacilities;
