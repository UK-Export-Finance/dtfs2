const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');
const assertLoanFormValues = require('./assert-loan-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

const goToPage = (deal) => {
  cy.loginGoToDealPage(user, deal);
  pages.contract.addLoanButton().click();
  partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/dates-repayments');
};

context('Loan Dates and Repayments', () => {
  let deal;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    cy.deleteDeals(user);
    cy.insertOneDeal(MOCK_DEAL, user)
      .then((insertedDeal) => deal = insertedDeal);
  });

  describe('when submitting an empty form', () => {
    it('it should progress to `Loan Preview` page and when returning to `Loan Dates and Repayments` page, should render validation errors', () => {
      goToPage(deal);
      partials.errorSummary.errorSummaryLinks().should('have.length', 0);
      pages.loanDatesRepayments.submit().click();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 2);
      pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('be.visible');
      pages.loanDatesRepayments.dayCountBasisInputErrorMessage().should('be.visible');
    });
  });

  describe('when a user selects that the Premium Type is `At maturity`', () => {
    it('should NOT render `Premium frequency` radio buttons and frequency validation error after submit', () => {
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
    it('should render `Premium frequency` radio button, render additional validation error in the page and after submit, render submitted value in `Loan Preview` after submit', () => {
      goToPage(deal);
      pages.loanDatesRepayments.premiumTypeInAdvanceInput().click();
      pages.loanDatesRepayments.submit().click();
      // TODO: assert preview value
      partials.loanProgressNav.progressNavLinkLoanDatesRepayments().click();
      partials.errorSummary.errorSummaryLinks().should('have.length', 2);
      pages.loanDatesRepayments.premiumTypeInputErrorMessage().should('not.be.visible');
      pages.loanDatesRepayments.premiumFrequencyInputErrorMessage().should('be.visible');
    });
  });
});
