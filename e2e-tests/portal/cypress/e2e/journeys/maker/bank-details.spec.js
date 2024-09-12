const { bankDetails, contract, contractCheckDealDetails } = require('../../pages');
const partials = require('../../partials');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Create deal', () => {
  const TOTAL_FORM_FIELDS = 2;

  describe('When an empty form is submitted', () => {
    it('should display validation errors', () => {
      cy.passRedLine(BANK1_MAKER1);
      bankDetails.bankDealId().clear();
      bankDetails.bankDealName().clear();

      cy.clickSubmitButton();

      cy.url().should('eq', relative('/before-you-start/bank-deal'));

      partials.errorSummaryLinks().should('have.length', TOTAL_FORM_FIELDS);
    });
  });

  it('should limit amount of text input characters', () => {
    cy.passRedLine(BANK1_MAKER1);
    bankDetails.bankDealId().clear();

    const BANK_DEAL_ID_CHARACTER_COUNT = 30;
    bankDetails.bankDealId().type('a'.repeat(BANK_DEAL_ID_CHARACTER_COUNT + 1));
    bankDetails.bankDealIdCount().should('have.text', 'You have 1 character too many');

    const BANK_DEAL_NAME_CHARACTER_COUNT = 100;
    bankDetails.bankDealName().type('a'.repeat(BANK_DEAL_NAME_CHARACTER_COUNT + 1));
    bankDetails.bankDealNameCount().should('have.text', 'You have 1 character too many');
  });

  it('When the a user fills in the bank details they progress to the deal page and the data they entered is visible', () => {
    cy.passRedLine(BANK1_MAKER1);

    // confirm that we're on '/before-you-start/bank-deal'
    cy.url().should('eq', relative('/before-you-start/bank-deal'));

    // complete 'before you start' form fields
    bankDetails.bankDealId().type('TEST1234');
    bankDetails.bankDealName().type('TESTING');
    cy.clickSubmitButton();

    // confirm that we're on the newly created deal '/contract/XYZ'
    cy.url().should('include', '/contract/');

    // confirm deal is in the correct starting state
    cy.assertText(contract.aboutSupplierDetailsStatus(), 'Not started');

    cy.assertText(contract.eligibilityStatus(), 'Not started');

    // confirm that the data we've entered appears on the preview page
    contract.checkDealDetailsTab().click();

    cy.assertText(contractCheckDealDetails.header(), 'Supply Contract name: TESTING');
  });
});
