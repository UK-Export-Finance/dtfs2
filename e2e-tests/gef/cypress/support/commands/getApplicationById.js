const { fetchApplicationById } = require('./api');
const { BANK1_MAKER1 } = require('../../../../e2e-fixtures/portal-users.fixture');
/**
 * getApplicationById
 * gets GEF application by dealId and returns it
 * @param {string} dealId
 */
const getApplicationById = (dealId) => {
  cy.apiLogin(BANK1_MAKER1)
    .then((token) => fetchApplicationById(dealId, token))
    .then(({ body }) => body);
};

module.exports = getApplicationById;
