const { contractAboutBuyer, contractAboutFinancial, contractAboutSupplier, contract } = require('../../pages');

context('About supply contract page titles', () => {
  before(() => {
    cy.createBssEwcsDeal({});
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
