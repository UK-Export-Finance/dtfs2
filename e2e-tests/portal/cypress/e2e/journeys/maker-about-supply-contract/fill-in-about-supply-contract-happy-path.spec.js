const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier, contractAboutPreview, defaults } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const twentyOneDeals = require('../../../fixtures/deal-dashboard-data');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;

  before(() => {
    const aDealWithAboutSupplyContractInStatus = (status) => {
      const candidates = twentyOneDeals.filter(
        (aDeal) =>
          aDeal.submissionDetails && status === aDeal.submissionDetails.status && aDeal.status === 'Draft' && (!aDeal.details || !aDeal.details.submissionDate),
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

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, using the companies house search.', () => {
    cy.login(BANK1_MAKER1);

    // go the long way for the first test- actually clicking via the contract page to prove the link..
    contract.visit(deal);

    // check the status is displaying correctly
    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Not started');

    contract.aboutSupplierDetailsLink().click();

    cy.title().should('eq', `Supplier information - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

    //---
    // check initial page state..
    //---

    // sections of the page that start hidden should be hidden
    contractAboutSupplier.supplierCorrespondenceAddress().line1().should('be.hidden');
    contractAboutSupplier.indemnifierName().should('be.hidden');
    // default values should be in place
    contractAboutSupplier.supplierAddress().country().should('have.value', '');
    contractAboutSupplier.errors().should('not.exist');

    //---
    // use companies-house lookup
    //---
    contractAboutSupplier.supplierType().select('Exporter');

    cy.keyboardInput(contractAboutSupplier.supplierCompaniesHouseRegistrationNumber(), MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);

    contractAboutSupplier.supplierSearchCompaniesHouse().click();

    // // the search should populate the supplier address fields
    contractAboutSupplier.supplierName().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().line1().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().town().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().postcode().should('not.have.value', '');
    contractAboutSupplier.supplierAddress().country().should('have.value', 'GBR');

    //---
    // fill in the simplest version of the form so we can submit it and save it..
    //---
    contractAboutSupplier.supplierCorrespondenceAddressSame().click();
    contractAboutSupplier.industrySector().select('1009'); // Information and communication
    contractAboutSupplier.industryClass().should('have.value', '');
    contractAboutSupplier.industryClass().select('62012'); // Business and domestic software development
    contractAboutSupplier.smeTypeMicro().click();

    cy.keyboardInput(contractAboutSupplier.supplyContractDescription(), 'Mock description');

    contractAboutSupplier.notLegallyDistinct().click();

    contractAboutSupplier.saveAndGoBack().click();

    // the deal page should reflect the partially-complete nature of the section
    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Incomplete');

    // check that the preview page renders the Submission Details component
    contractAboutPreview.visit(deal);
    contractAboutPreview.submissionDetails().should('be.visible');

    cy.assertText(partials.taskListHeader.itemStatus('supplier-and-counter-indemnifier/guarantor'), 'Completed');
  });
});
