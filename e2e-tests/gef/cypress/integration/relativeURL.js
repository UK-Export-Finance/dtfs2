const base = Cypress.config('baseUrl');

module.exports = (relativeUrl) => {
  return `${base}${relativeUrl}`;
};
