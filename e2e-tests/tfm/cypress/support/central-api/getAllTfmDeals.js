const { getAllTfmDeals } = require('./api');

module.exports = () =>
  new Cypress.Promise((resolve) => {
    getAllTfmDeals().then((deals) => resolve(deals));
  });
