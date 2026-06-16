const { logIn, createFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (dealId, facilities, user) => {
  console.info('createFacilities::');

  return logIn(user).then((token) => {
    const facilitiesWithUkefIds = facilities.map((facilityToInsert) => {
      const ukefId = getIdFromNumberGenerator();

      return {
        ...facilityToInsert,
        ukefFacilityId: ukefId,
      };
    });

    return createFacilities(dealId, facilitiesWithUkefIds, user, token);
  });
};
