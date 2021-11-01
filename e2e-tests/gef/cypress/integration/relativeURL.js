const base = Cypress.config('baseUrl');

module.exports = (relativeUrl) => `${base}${relativeUrl}`;
