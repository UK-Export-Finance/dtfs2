const { logIn, createGefFacilities, updateGefFacilities } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (dealId, facilities, user) => {
  logIn(user).then((token) => {
    facilities.forEach((facilityToInsert) => {
      const ukefId = getIdFromNumberGenerator();
      const facilityWithId = {
        ...facilityToInsert,
        ukefFacilityId: ukefId,
      };

      createGefFacilities(dealId, facilityWithId, facilityWithId.type, user, token).then((createdFacilities) => {
        const facilityId = createdFacilities.details._id;

        updateGefFacilities(facilityId, facilityToInsert, token).then((updated) => updated);
      });
    });
  });
};
