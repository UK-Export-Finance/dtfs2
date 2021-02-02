const { updateFacility } = require('./api');

module.exports = (facilityId, update, user) => {
  console.log('updateFacility::');

  updateFacility(
    facilityId,
    update,
    user,
  ).then((updatedFacility) => updatedFacility);
};
