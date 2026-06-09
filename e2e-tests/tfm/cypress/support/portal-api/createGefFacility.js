const { logIn, createGefFacilities, updateGefFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (dealId, facilities, user) => {
  console.info('createGEFFacilities::');

  return logIn(user).then((token) => {
    return Cypress.Promise.all(
      facilities.map((facilityToInsert) => {
        const ukefId = getIdFromNumberGenerator();
        const facilityWithId = {
          ...facilityToInsert,
          ukefFacilityId: ukefId,
        };

        return createGefFacilities(dealId, facilityWithId, facilityWithId.type, user, token).then((createdFacilities) => {
          const facilityId = createdFacilities.details._id;
          return updateGefFacilities(facilityId, facilityToInsert, token).then(() => createdFacilities);
        });
      }),
    ).then((createdFacilities) => createdFacilities[0]);
  });
};
