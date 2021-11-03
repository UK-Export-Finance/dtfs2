const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.log('deleteFacility::');

  new Cypress.Promise((resolve, reject) => {
    deleteFacility(facilityId, user);
    resolve();
  });
};
