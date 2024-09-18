const { MOCK_COMPANY_REGISTRATION_NUMBERS } = require('@ukef/dtfs2-common');
const { contract, contractAboutSupplier, contractAboutPreview, defaults } = require('../../pages');
const partials = require('../../partials');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const { additionalRefName } = require('../../../fixtures/deal');

const { ADMIN } = MOCK_USERS;

context('about-supply-contract', () => {
  let deal;

  before(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssDeal({});
  });

  it('A maker picks up a deal in status=Draft, and fills in the about-supply-contract section, using the companies house search.', () => {
    // check the status is displaying correctly
    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Not started');

    contract.aboutSupplierDetailsLink().click();

    cy.title().should('eq', `Supplier information - ${additionalRefName}${defaults.pageTitleAppend}`);

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
    contractAboutSupplier.supplierCompaniesHouseRegistrationNumber().type(MOCK_COMPANY_REGISTRATION_NUMBERS.VALID);
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
    contractAboutSupplier.supplyContractDescription().type('Typing in tests takes time.');
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
