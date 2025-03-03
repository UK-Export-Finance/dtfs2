const { contractAboutBuyer, contractAboutFinancial, contractAboutSupplier } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('About supply contract page titles', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.deleteGefApplications(ADMIN);

    cy.createBssEwcsDeal();
  });

  beforeEach(() => {
    cy.saveSession();

    cy.loginGoToDealPage(BANK1_MAKER1);

    cy.getDealIdFromUrl(4).then((dealId) => {
      contractAboutSupplier.visit(dealId);
    });
  });

  it('should display correct page title for buyer', () => {
    contractAboutSupplier.nextPage().click();
    cy.assertText(contractAboutBuyer.title(), 'Add buyer details');
  });

  it('should display correct page title for financial information', () => {
    contractAboutSupplier.nextPage().click();
    contractAboutBuyer.nextPage().click();
    cy.assertText(contractAboutFinancial.title(), 'Add financial information');
  });

  it('should display correct page title for Supplier and counter-indemnifier/guarantor', () => {
    cy.assertText(contractAboutSupplier.title(), 'About the Supply Contract');
  });
});
