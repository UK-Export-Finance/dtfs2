const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier } = require('../../pages');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const CONSTANTS = require('../../../fixtures/constants');
const twentyOneDeals = require('../../../fixtures/deal-dashboard-data');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;
const { INDUSTRY_SECTOR_CODES, DEALS } = CONSTANTS;

context('Supply contract form - create element and check if inserted into deal', () => {
  let deal;

  before(() => {
    const aDealWithAboutSupplyContractInStatus = (status) => {
      const candidates = twentyOneDeals.filter(
        (aDeal) =>
          aDeal.submissionDetails &&
          status === aDeal.submissionDetails.status &&
          aDeal.status === DEALS.DEAL_STATUS.DRAFT &&
          (!aDeal.details || !aDeal.details.submissionDate),
      );

      const aDeal = candidates[0];
      if (!aDeal) {
        throw new Error('no suitable test data found');
      } else {
        return aDeal;
      }
    };

    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(aDealWithAboutSupplyContractInStatus('Not started'), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
    });
  });

  it("should not insert created element's data in the feedback", () => {
    cy.login(BANK1_MAKER1);

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);

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

    cy.getDeal(deal._id, BANK1_MAKER1).then((updatedDeal) => {
      // ensure the updated deal does not contain additional intruder field
      expect(updatedDeal.submissionDetails.intruder).to.be.an('undefined');
    });
  });
});
