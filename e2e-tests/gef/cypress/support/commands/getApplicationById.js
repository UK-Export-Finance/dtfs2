const { fetchApplicationById } = require('./api');
const CREDENTIALS = require('../../fixtures/credentials.json');

/**
 * getApplicationById
 * gets GEF application by dealId and returns it
 * @param {String} dealId
 */
const getApplicationById = (dealId) => {
  cy.apiLogin(CREDENTIALS.MAKER)
    .then((token) => fetchApplicationById(dealId, token))
    .then(({ body }) => body);
};

module.exports = getApplicationById;
