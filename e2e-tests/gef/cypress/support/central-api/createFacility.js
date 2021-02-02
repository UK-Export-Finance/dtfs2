const { createFacility } = require('./api');

module.exports = (facility, dealId, user) => {
  console.log('createFacility::');

  createFacility(
    facility,
    dealId,
    user,
  ).then((createdFacility) => createdFacility);
};
