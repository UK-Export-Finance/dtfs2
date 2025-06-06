const pages = require('../../pages');
const partials = require('../../partials');
const fillLoanForm = require('./fill-loan-forms');
const MOCK_USERS = require('../../../../../e2e-fixtures');
const relative = require('../../relativeURL');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const goToPage = (bssDealId) => {
  cy.login(BANK1_MAKER1);
  const url = relative(`/contract/${bssDealId}`);
  cy.visit(url);
  cy.clickAddLoanButton();
  partials.taskListHeader.itemLink('dates-and-repayments').click();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/dates-repayments');
};

const assertNoValidationErrors = () => {
  partials.errorSummaryLinks().should('have.length', 0);
  pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('not.exist');
  pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('not.exist');
  pages.loanDatesRepayments.dayCountBasisInputErrorMessage().should('not.exist');
};

context('Loan Dates and Repayments', () => {
  let bssDealId;

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal().then((dealId) => {
      bssDealId = dealId;
    });
  });

  describe('Loan Dates and Repayments title', () => {
    it('should contain the correct title', () => {
      goToPage(bssDealId);

      pages.loanDatesRepayments.title().contains('Add dates and repayments');
    });
  });

  describe('when submitting an empty form', () => {
    it('should progress to `Loan Preview` page, should render validation errors in `Loan Dates and Repayments` page', () => {
      goToPage(bssDealId);
      assertNoValidationErrors();
      cy.clickSubmitButton();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/check-your-answers');

      partials.taskListHeader.itemLink('dates-and-repayments').click();
      cy.url().should('include', '/dates-repayments');

      partials.errorSummaryLinks().should('have.length', 2);
      pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('be.visible');
      pages.loanDatesRepayments.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  describe('when a user selects that the Premium Type is `At maturity`, submits the form and returns to the page', () => {
    it('should NOT render `Premium frequency` radio buttons and `Premium frequency` validation error', () => {
      goToPage(bssDealId);
      pages.loanDatesRepayments.premiumTypeAtMaturityInput().click();
      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('not.be.visible');
      cy.clickSubmitButton();
      cy.url().should('include', '/check-your-answers');

      partials.taskListHeader.itemLink('dates-and-repayments').click();
      cy.url().should('include', '/dates-repayments');

      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('not.be.visible');
      pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('not.exist');
    });
  });

  describe('when a user selects that the Premium Type is NOT `At maturity`', () => {
    it('should render `Premium frequency` radio buttons and after submit, when returning to page, render `Premium frequency` validation error', () => {
      goToPage(bssDealId);
      pages.loanDatesRepayments.premiumTypeInAdvanceInput().click();
      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().parent().should('be.visible');

      pages.loanDatesRepayments.premiumTypeInArrearInput().click();
      pages.loanDatesRepayments.premiumFrequencyQuarterlyInput().parent().should('be.visible');

      pages.loanDatesRepayments.premiumTypeInAdvanceInput().click();

      cy.clickSubmitButton();
      cy.url().should('include', '/check-your-answers');

      partials.taskListHeader.itemLink('dates-and-repayments').click();
      partials.errorSummaryLinks().should('have.length', 2);

      pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('not.exist');
      pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('be.visible');
    });
  });

  describe('when a user changes and submits the premiumType and premiumFrequency multiple times', () => {
    it('should prepopulate correct values when returning to the page', () => {
      goToPage(bssDealId);
      fillLoanForm.datesRepayments.inAdvanceAnnually();
      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('dates-and-repayments').click();
      pages.loanDatesRepayments.premiumTypeInAdvanceInput().should('be.checked');
      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('be.checked');
      assertNoValidationErrors();

      fillLoanForm.datesRepayments.inArrearQuarterly();
      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('dates-and-repayments').click();
      pages.loanDatesRepayments.premiumTypeInArrearInput().should('be.checked');
      pages.loanDatesRepayments.premiumFrequencyQuarterlyInput().should('be.checked');
      assertNoValidationErrors();
    });
  });

  describe('when all required fields are provided', () => {
    it('should display a completed status tag in task list header', () => {
      goToPage(bssDealId);
      fillLoanForm.datesRepayments.inAdvanceAnnually();
      cy.clickSubmitButton();
      cy.url().should('include', '/check-your-answers');

      cy.assertText(partials.taskListHeader.itemStatus('dates-and-repayments'), 'Completed');

      partials.taskListHeader.itemLink('dates-and-repayments').click();

      cy.url().should('include', '/dates-repayments');

      cy.assertText(partials.taskListHeader.itemStatus('dates-and-repayments'), 'Completed');
    });
  });

  describe('when a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to the page', () => {
      goToPage(bssDealId);
      fillLoanForm.datesRepayments.inAdvanceAnnually();
      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;
        cy.clickSaveGoBackButton();

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.nameLink().click();
        partials.taskListHeader.itemLink('dates-and-repayments').click();

        pages.loanDatesRepayments.premiumTypeInAdvanceInput().should('be.checked');
        pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('be.checked');
        pages.loanDatesRepayments.dayCountBasis365Input().should('be.checked');
      });
    });
  });
});
