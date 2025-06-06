const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const CONSTANTS = require('../../../fixtures/constants');
const relative = require('../../relativeURL');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;
const { INDUSTRY_SECTOR_CODES } = CONSTANTS;

context('Supply contract form - create element and check if inserted into deal', () => {
  let bssDealId;
  let contractUrl;

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  it("should not insert created element's data in the feedback", () => {
    cy.login(BANK1_MAKER1);

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    cy.visit(contractUrl);

    contract.aboutSupplierDetailsLink().click();

    //---
    // use companies-house lookup
    //---
    contractAboutSupplier.supplierType().select('Exporter');
    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    //---
    // fill in the simplest version of the form so we can submit it and save it..
    //---
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select(INDUSTRY_SECTOR_CODES.INFORMATION); // Information and communication
    contractAboutSupplier.industryClass().should('have.value', '');
    contractAboutSupplier.industryClass().select(INDUSTRY_SECTOR_CODES.BUSINESS); // Business and domestic software development
    contractAboutSupplier.smeTypeMicro().click();
    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Mock description');
    contractAboutSupplier.notLegallyDistinct().click();

    cy.insertElement('supplier-form');

    contractAboutSupplier.nextPage().click();

    cy.getDeal(bssDealId, BANK1_MAKER1).then((updatedDeal) => {
      // ensure the updated deal does not contain additional intruder field
      expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    });
  });
});
