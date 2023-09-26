const { logIn, createFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (dealId, facilities, user) => {
  console.info('createFacilities::');

  logIn(user).then((token) => {
    const facilitiesWithUkefIds = [];

    facilities.forEach((facilityToInsert) => {
      const ukefId = getIdFromNumberGenerator();
      const facilityWithId = {
        ...facilityToInsert,
        ukefFacilityId: ukefId,
      };

      facilitiesWithUkefIds.push(facilityWithId);

      if (facilitiesWithUkefIds.length === facilities.length) {
        createFacilities(
          dealId,
          facilitiesWithUkefIds,
          user,
          token,
        ).then((createdFacilities) => createdFacilities);
      }
    });
  });
};
