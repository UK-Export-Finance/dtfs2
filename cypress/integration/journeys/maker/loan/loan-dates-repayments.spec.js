const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');

const mockUsers = require('../../../../fixtures/mockUsers');
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
  submissionDetails: {
    supplyContractCurrency: {
      id: 'GBP',
    },
  },
};

const goToPage = (deal) => {
  cy.loginGoToDealPage(MAKER_LOGIN, deal);
  pages.contract.addLoanButton().click();
  partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/dates-repayments');
};

const assertNoValidationErrors = () => {
  partials.errorSummary.errorSummaryLinks().should('have.length', 0);
  pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('not.be.visible');
  pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('not.be.visible');
  pages.loanDatesRepayments.dayCountBasisInputErrorMessage().should('not.be.visible');
};

context('Loan Dates and Repayments', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(MOCK_DEAL, MAKER_LOGIN)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('when submitting an empty form', () => {
    it('should progress to `Loan Preview` page, should render validation errors in `Loan Dates and Repayments` page', () => {
      goToPage(deal);
      assertNoValidationErrors();
      pages.loanDatesRepayments.submit().click();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();
      cy.url().should('include', '/dates-repayments');

      partials.errorSummary.errorSummaryLinks().should('have.length', 2);
      pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('be.visible');
      pages.loanDatesRepayments.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  describe('when a user selects that the Premium Type is `At maturity`, submits the form and returns to the page', () => {
    it('should NOT render `Premium frequency` radio buttons and `Premium frequency` validation error', () => {
      goToPage(deal);
      pages.loanDatesRepayments.premiumTypeAtMaturityInput().click();
      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('not.be.visible');
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();
      cy.url().should('include', '/dates-repayments');

      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('not.be.visible');
      pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('not.be.visible');
    });
  });

  describe('when a user selects that the Premium Type is NOT `At maturity`', () => {
    it('should render `Premium frequency` radio buttons and after submit, when returning to page, render `Premium frequency` validation error', () => {
      goToPage(deal);
      pages.loanDatesRepayments.premiumTypeInAdvanceInput().click();
      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('be.visible');

      pages.loanDatesRepayments.premiumTypeInArrearInput().click();
      pages.loanDatesRepayments.premiumFrequencyQuarterlyInput().should('be.visible');

      pages.loanDatesRepayments.premiumTypeInAdvanceInput().click();

      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();
      partials.errorSummary.errorSummaryLinks().should('have.length', 2);

      pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('not.be.visible');
      pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('be.visible');
    });
  });

  describe('when a user changes and submits the premiumType and premiumFrequency multiple times', () => {
    it('should prepopulate correct values when returning to the page', () => {
      goToPage(deal);
      fillLoanForm.datesRepayments.inAdvanceAnnually();
      pages.loanDatesRepayments.submit().click();

      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();
      pages.loanDatesRepayments.premiumTypeInAdvanceInput().should('be.checked');
      pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('be.checked');
      assertNoValidationErrors();

      fillLoanForm.datesRepayments.inArrearQuarterly();
      pages.loanDatesRepayments.submit().click();

      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();
      pages.loanDatesRepayments.premiumTypeInArrearInput().should('be.checked');
      pages.loanDatesRepayments.premiumFrequencyQuarterlyInput().should('be.checked');
      assertNoValidationErrors();
    });
  });

  describe('when all required fields are provided', () => {
    it('should display a checked `Loan Dates repayments` checkbox in progress nav', () => {
      goToPage(deal);
      fillLoanForm.datesRepayments.inAdvanceAnnually();
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanDatesRepaymentsCompletedCheckbox().should('be.visible');
      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();

      cy.url().should('include', '/dates-repayments');
      partials.loanProgressNav.progressNavLinkLoanDatesRepaymentsCompletedCheckbox().should('be.visible');
    });
  });

  describe('when a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to the page', () => {
      goToPage(deal);
      fillLoanForm.datesRepayments.inAdvanceAnnually();
      partials.loanProgressNav.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;
        pages.loanDatesRepayments.saveGoBackButton().click();

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.bankReferenceNumberLink().click();
        partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();

        pages.loanDatesRepayments.premiumTypeInAdvanceInput().should('be.checked');
        pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().should('be.checked');
        pages.loanDatesRepayments.dayCountBasis365Input().should('be.checked');
      });
    });
  });
});
