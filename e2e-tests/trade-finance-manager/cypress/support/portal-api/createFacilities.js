const { logIn, createFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (dealId, facilities, user) => {
  console.log('createFacilities::');

  logIn(user).then((token) => {
    const facilitiesWithUkefIds = [];

    facilities.forEach((facilityToInsert) => {
      const ukefId = getIdFromNumberGenerator();
      const facilityWithId = {
        ...facilityToInsert,
        ukefFacilityID: ukefId,
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
  //  return Promise.resolve(facilitiesWithUkefIds);
  });
};
