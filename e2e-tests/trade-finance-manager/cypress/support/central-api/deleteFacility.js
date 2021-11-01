const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.log('deleteFacility::');

  new Cypress.Promise((resolve) => {
    deleteFacility(facilityId, user);
    resolve();
  });
};
