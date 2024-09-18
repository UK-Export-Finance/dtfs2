const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const CONSTANTS = require('../../../fixtures/constants');

const { ADMIN } = MOCK_USERS;
const { INDUSTRY_SECTOR_CODES } = CONSTANTS;

context('Supply contract form - create element and check if inserted into deal', () => {
  before(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssDeal({});
  });

  it("should not insert created element's data in the feedback", () => {
    contract.aboutSupplierDetailsLink().click();

    //---
    // use companies-house lookup
    //---
    contractAboutSupplier.supplierType().select('Exporter');
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type(MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    //---
    // fill in the simplest version of the form so we can submit it and save it..
    //---
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select(INDUSTRY_SECTOR_CODES.INFORMATION); // Information and communication
    contractAboutSupplier.industryClass().should('have.value', '');
    contractAboutSupplier.industryClass().select(INDUSTRY_SECTOR_CODES.BUSINESS); // Business and domestic software development
    contractAboutSupplier.smeTypeMicro().click();
    contractAboutSupplier.supplyContractDescription().type('Typing in tests takes time.');
    contractAboutSupplier.notLegallyDistinct().click();

    cy.insertElement('supplier-form');

    contractAboutSupplier.nextPage().click();

    // TODO
    // cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
    //   // ensure the updated deal does not contain additional intruder field
    //   expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    // });
  });
});
