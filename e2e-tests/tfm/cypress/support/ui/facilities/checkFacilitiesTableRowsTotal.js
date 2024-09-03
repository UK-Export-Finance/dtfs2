const facilitiesPage = require('../../../e2e/pages/facilitiesPage');

module.exports = (numberOfRows) => {
  facilitiesPage.facilitiesTableRows().should('have.length', numberOfRows);
};
