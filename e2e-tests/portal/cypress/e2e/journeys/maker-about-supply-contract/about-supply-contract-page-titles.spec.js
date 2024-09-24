const { contractAboutBuyer, contractAboutFinancial, contractAboutSupplier, contract } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('About supply contract page titles', () => {
  before(() => {
    cy.createBssEwcsDeal({});
    cy.loginGoToDealPage(BANK1_MAKER1);
  });

  it('displays correct page title for buyer', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.title().contains('Add buyer details');
  });

  it('displays correct page title for financial information', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    contractAboutFinancial.title().contains('Add financial information');
  });

  it('displays correct page title for Supplier and counter-indemnifier/guarantor', () => {
    contract.aboutSupplierDetailsLink().click();
    contractAboutSupplier.title().contains('About the Supply Contract');
  });
});
