const mapGefFacility = require('./mapGefFacility');

const mapGefFacilities = (facilities, dealSnapshot) => {
  const mappedFacilities = [];

  console.log('mapGefFacilities......facilities \n', facilities);
  // console.log('mapGefFacilities......dealSnapshot \n', dealSnapshot);

  facilities.forEach((f) => {
    // mappedFacilities.push({
    //   _id: f._id, // eslint-disable-line no-underscore-dangle
    //   facilitySnapshot: mapGefFacility(f, dealSnapshot),
    //   tfm: {},
    // });

    mappedFacilities.push(mapGefFacility(f, dealSnapshot));
  });

  console.log('mapGefFacilities......mappedFacilities \n', mappedFacilities);

  return mappedFacilities;
};

module.exports = mapGefFacilities;
