const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.info('deleteFacility::');

  // eslint-disable-next-line no-new
  new Cypress.Promise((resolve) => {
    deleteFacility(facilityId, user, {
      userType: 'portal',
      id: user?._id ?? 'abcdef123456abcdef123456',
    });
    resolve();
  });
};
