const {
  contractAboutSupplier, contractAboutPreview,
} = require('../../../pages');

const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

// test data we want to set up + work with..
const aDealWithAboutSupplyContractComplete = require('./dealWithFirstPageComplete.json');

context('about-supply-contract', () => {
  let deal;

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithAboutSupplyContractComplete, MAKER_LOGIN)
      .then((insertedDeal) => { deal = insertedDeal; });
  });

  it('A maker picks up a deal with every field filled in and starts deselecting "separate indemnifier correspondence address" etc.', () => {
    cy.login(MAKER_LOGIN);

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.indemnifierCorrespondenceAddressNotDifferent().click();
    contractAboutSupplier.saveAndGoBack().click();

    contractAboutPreview.visit(deal);
    contractAboutPreview.indemnifierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddress().country().should('not.exist');

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.notLegallyDistinct().click();
    contractAboutSupplier.saveAndGoBack().click();

    contractAboutPreview.visit(deal);
    contractAboutPreview.indemnifierCompaniesHouseRegistrationNumber().should('not.exist');
    contractAboutPreview.indemnifierName().should('not.exist');
    contractAboutPreview.indemnifierAddress().line1().should('not.exist');
    contractAboutPreview.indemnifierAddress().line2().should('not.exist');
    contractAboutPreview.indemnifierAddress().town().should('not.exist');
    contractAboutPreview.indemnifierAddress().line3().should('not.exist');
    contractAboutPreview.indemnifierAddress().postcode().should('not.exist');
    contractAboutPreview.indemnifierAddress().country().should('not.exist');
    contractAboutPreview.indemnifierCorrespondenceAddressDifferent().should('not.exist');

    contractAboutSupplier.visit(deal);
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.saveAndGoBack().click();

    contractAboutPreview.visit(deal);
    contractAboutPreview.supplierCorrespondenceAddress().line1().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line2().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().town().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().line3().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().postcode().should('not.exist');
    contractAboutPreview.supplierCorrespondenceAddress().country().should('not.exist');
  });
});
