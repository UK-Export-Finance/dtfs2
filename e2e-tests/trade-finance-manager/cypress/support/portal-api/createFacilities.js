const { logIn, createFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (dealId, facilities, user) => {
  console.log('createFacilities::');

  logIn(user).then((token) => {
    const facilitiesWithUkefIds = [];

    facilities.forEach((facilityToInsert) => {
      getIdFromNumberGenerator('facility').then(({ id: numberGeneratorId }) => {
        const facilityWithId = facilityToInsert;
        facilityWithId.ukefFacilityID = numberGeneratorId;

        facilitiesWithUkefIds.push(facilityWithId);

        if (facilitiesWithUkefIds.length === facilities.length) {
          createFacilities(
            dealId,
            facilities,
            user,
            token,
          ).then((createdFacilities) => createdFacilities);
        }
      });
    });
  });
};
