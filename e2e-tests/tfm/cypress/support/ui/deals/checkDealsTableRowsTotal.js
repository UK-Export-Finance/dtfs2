const dealsPage = require('../../../e2e/pages/dealsPage');

module.exports = (numberOfRows) => {
  dealsPage.dealsTableRows().should('have.length', numberOfRows);
};
