const { contractAboutBuyer, contractAboutFinancial, contractAboutSupplier } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('About supply contract page titles', () => {
  let bssDealId;

  before(() => {
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  it('displays correct page title for buyer', () => {
    cy.login(BANK1_MAKER1);

    contractAboutBuyer.visit(bssDealId);
    contractAboutBuyer.title().contains('Add buyer details');
  });

  it('displays correct page title for financial information', () => {
    cy.login(BANK1_MAKER1);

    contractAboutFinancial.visit(bssDealId);
    contractAboutFinancial.title().contains('Add financial information');
  });

  it('displays correct page title for Supplier and counter-indemnifier/guarantor', () => {
    cy.login(BANK1_MAKER1);

    contractAboutSupplier.visit(bssDealId);
    contractAboutSupplier.title().contains('About the Supply Contract');
  });
});
