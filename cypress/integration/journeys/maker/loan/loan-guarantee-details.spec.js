const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');
const LOAN_FORM_VALUES = require('./loan-form-values');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

context('Loan Guarantee Details', () => {
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
    it('it should progress to `Loan Financial Details` page and after proceeding to `Loan Preview` page and returning to `Loan Guarantee Details` page, should render Facility stage validation error', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      cy.url().should('include', '/contract');
      cy.url().should('include', '/loan/');
      cy.url().should('include', '/guarantee-details');

      pages.loanGuaranteeDetails.submit().click();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/financial-details');

      pages.loanFinancialDetails.submit().click();

      cy.url().should('include', '/dates-repayments');
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');

      partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();

      cy.url().should('include', '/guarantee-details');

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);
      pages.loanGuaranteeDetails.facilityStageErrorMessage().should('be.visible');
    })
  });

  describe('when user selects different Facility stage options (`Conditional` or `Unconditional`)', () => {
    it('should render additional form fields and validation errors without leaving the page', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      // Facility stage = Conditional
      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.bankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsErrorMessage().should('be.visible');

      // Facility stage = Unconditional
      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();

      pages.loanGuaranteeDetails.bankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.bankReferenceNumberErrorMessage().should('be.visible');

      pages.loanGuaranteeDetails.coverEndDateDayInput().should('be.visible');
      pages.loanGuaranteeDetails.coverEndDateMonthInput().should('be.visible');
      pages.loanGuaranteeDetails.coverEndDateYearInput().should('be.visible');
      pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');
    });
  });

  describe('when user submits Facility stage as `Conditional`', () => {
    it('should render additional form fields and validation errors when returning to the page ', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
      pages.loanGuaranteeDetails.submit().click();

      partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);

      pages.loanGuaranteeDetails.facilityStageConditionalInput().should('be.checked');
      pages.loanGuaranteeDetails.bankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.bankReferenceNumberErrorMessage().should('not.be.visible');

      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('be.visible');
      pages.loanGuaranteeDetails.ukefGuaranteeInMonthsErrorMessage().should('be.visible');
    });
  });

  describe('when user submits Facility stage as `Unconditional`', () => {
    it('should render additional form fields and validation errors when returning to the page ', () => {
      cy.loginGoToDealPage(user, deal);
      pages.contract.addLoanButton().click();

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
      pages.loanGuaranteeDetails.submit().click();

      partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 1);

      pages.loanGuaranteeDetails.facilityStageUnconditionalInput().should('be.checked');

      pages.loanGuaranteeDetails.bankReferenceNumberInput().should('be.visible');
      pages.loanGuaranteeDetails.bankReferenceNumberErrorMessage().should('be.visible');

      pages.loanGuaranteeDetails.coverEndDateDayInput().should('be.visible');
      pages.loanGuaranteeDetails.coverEndDateMonthInput().should('be.visible');
      pages.loanGuaranteeDetails.coverEndDateYearInput().should('be.visible');
      pages.loanGuaranteeDetails.coverEndDateErrorMessage().should('be.visible');
    });
  });

  // should prepopulate form inputs


});
