const { logIn, createGefFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (dealId, facilities, user) => {
  console.info('createGEFFacilities::');

  logIn(user).then((token) => {
    const facilitiesWithUkefIds = [];

    facilities.forEach((facilityToInsert) => {
      const ukefId = getIdFromNumberGenerator();
      const facilityWithId = {
        ...facilityToInsert,
        ukefFacilityId: ukefId,
      };

      createGefFacilities(
        dealId,
        facilitiesWithUkefIds,
        facilityWithId.type,
        user,
        token,
      ).then((createdFacilities) => createdFacilities);
    });
  //  return Promise.resolve(facilitiesWithUkefIds);
  });
};
