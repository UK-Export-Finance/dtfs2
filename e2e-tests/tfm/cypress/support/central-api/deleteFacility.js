const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.info('deleteFacility::');

  // eslint-disable-next-line no-new
  new Cypress.Promise((resolve) => {
    deleteFacility(facilityId, user);
    resolve();
  });
};
