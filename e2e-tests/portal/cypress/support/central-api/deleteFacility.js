const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.info('deleteFacility::');

  new Cypress.Promise((resolve) => {
    deleteFacility(facilityId, user);
    resolve();
  });
};
