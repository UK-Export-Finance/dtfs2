const pages = require('../../pages');
const partials = require('../../partials');
const fillBondForm = require('./fill-bond-forms');
const assertBondFormValues = require('./assert-bond-form-values');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const goToBondFeeDetailsPage = (bssDealId) => {
  cy.login(BANK1_MAKER1);
  cy.visit(relative(`/contract/${bssDealId}`));

  cy.clickAddBondButton();
  partials.taskListHeader.itemLink('fee-details').click();
  cy.url().should('include', '/fee-details');
};

context('Bond Fee Details', () => {
  let bssDealId;
  let contractUrl;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
      contractUrl = relative(`/contract/${bssDealId}`);
    });
  });

  describe('when submitting an empty form and navigating back to `Bond Fee Details` page', () => {
    it('should display validation errors for all required fields', () => {
      goToBondFeeDetailsPage(bssDealId);
      cy.title().should('eq', `Bond Fee Details${pages.defaults.pageTitleAppend}`);

      cy.clickSubmitButton();

      cy.url().should('include', '/check-your-answers');
      partials.taskListHeader.itemLink('fee-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFeeDetails.feeTypeInputErrorMessage().should('be.visible');
      pages.bondFeeDetails.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  describe('after submitting one form field and navigating back to `Bond Fee Details` page', () => {
    it('should display validation errors for all required fields (including nested radio group)', () => {
      goToBondFeeDetailsPage(bssDealId);

      pages.bondFeeDetails.feeTypeInAdvanceInput().click();

      cy.clickSubmitButton();

      cy.url().should('include', '/check-your-answers');
      partials.taskListHeader.itemLink('fee-details').click();

      const TOTAL_REQUIRED_FORM_FIELDS = 2;

      partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.bondFeeDetails.feeFrequencyInputErrorMessage().should('be.visible');
      pages.bondFeeDetails.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  it('should display the correct title for bond fee details', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);

    cy.clickAddBondButton();
    partials.taskListHeader.itemLink('fee-details').click();

    pages.bondFeeDetails.title().contains('Add fee details');
  });

  it('form submit of all required fields should render a `completed` status tag only for `Bond Fee Details` in task list header', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(contractUrl);

    cy.clickAddBondButton();
    partials.taskListHeader.itemLink('fee-details').click();

    fillBondForm.feeDetails();

    cy.clickSubmitButton();

    cy.assertText(partials.taskListHeader.itemStatus('fee-details'), 'Completed');
    cy.assertText(partials.taskListHeader.itemStatus('bond-details'), 'Incomplete');
    cy.assertText(partials.taskListHeader.itemStatus('financial-details'), 'Incomplete');
  });

  it('form submit should progress to the `Bond Preview` page and prepopulate submitted form fields when returning back to `Bond Fee Details` page', () => {
    goToBondFeeDetailsPage(bssDealId);

    fillBondForm.feeDetails();
    cy.clickSubmitButton();

    cy.url().should('include', '/contract');
    cy.url().should('include', '/bond/');
    cy.url().should('include', '/check-your-answers');

    partials.taskListHeader.itemLink('fee-details').click();
    cy.url().should('include', '/fee-details');

    assertBondFormValues.feeDetails();
  });

  describe('when a user selects that the Fee Type is `At maturity`', () => {
    it('should NOT render `Fee frequency` radio buttons', () => {
      goToBondFeeDetailsPage(bssDealId);

      pages.bondFeeDetails.feeTypeAtMaturityInput().click();

      cy.get('.govuk-radios__item:visible').should('have.length', 5);
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Bond Fee Details` page', () => {
      goToBondFeeDetailsPage(bssDealId);

      fillBondForm.feeDetails();

      partials.taskListHeader.bondId().then((bondIdHiddenInput) => {
        const bondId = bondIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();

        cy.url().should('not.include', '/fee-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.bondTransactionsTable.row(bondId);

        row.uniqueNumberLink().click();
        partials.taskListHeader.itemLink('fee-details').click();
        cy.url().should('include', '/fee-details');

        assertBondFormValues.feeDetails();
      });
    });
  });
});
