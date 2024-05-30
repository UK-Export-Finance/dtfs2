const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');
const { deleteFacility } = require('./api');

module.exports = (facilityId, user) => {
  console.info('deleteFacility::');

  // eslint-disable-next-line no-new
  new Cypress.Promise((resolve) => {
    deleteFacility(facilityId, user, {
      userType: 'portal',
      id: user?._id ?? BANK1_CHECKER1_WITH_MOCK_ID._id,
    });
    resolve();
  });
};
