const pages = require('../../../pages');
const partials = require('../../../partials');
const fillLoanForm = require('./fill-loan-forms');
const assertLoanFormValues = require('./assert-loan-form-values');
const {
  calculateExpectedGuaranteeFee,
  calculateExpectedUkefExposure,
} = require('../../../../support/portal/sectionCalculations');

const user = { username: 'MAKER', password: 'MAKER' };

const MOCK_DEAL = {
  details: {
    bankSupplyContractID: 'someDealId',
    bankSupplyContractName: 'someDealName',
  },
};

const goToPageWithUnconditionalFacilityStage = (deal) => {
  cy.loginGoToDealPage(user, deal);
  pages.contract.addLoanButton().click();

  pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
  pages.loanGuaranteeDetails.submit().click();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/financial-details');
};

const goToPage = (deal) => {
  cy.loginGoToDealPage(user, deal);
  pages.contract.addLoanButton().click();
  partials.loanProgressNav.progressNavLinkLoanFinancialDetails().click();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/financial-details');
};

context('Loan Financial Details', () => {
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
    it('it should progress to `Loan Dates and Repayments` page and after proceeding to `Loan Preview` page and when returning to `Loan Guarantee Details` page, should render validation errors', () => {
      goToPageWithUnconditionalFacilityStage(deal);

      partials.errorSummary.errorSummaryLinks().should('have.length', 0);
      pages.loanFinancialDetails.submit().click();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/dates-repayments');
      pages.loanDatesRepayments.submit().click();
      cy.url().should('include', '/preview');
      partials.loanProgressNav.progressNavLinkLoanFinancialDetails().click();

      partials.errorSummary.errorSummaryLinks().should('have.length', 5);
      pages.loanFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.disbursementAmountInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.interestMarginFeeInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
    });
  });

  it('should only render the disbursementAmount field when the facilityStage is `Unconditional`', () => {
    goToPageWithUnconditionalFacilityStage(deal);

    pages.loanFinancialDetails.disbursementAmountInput().should('be.visible');

    partials.loanProgressNav.progressNavLinkLoanGuaranteeDetails().click();
    pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
    pages.loanGuaranteeDetails.submit().click();

    cy.url().should('include', '/financial-details');

    pages.loanFinancialDetails.disbursementAmountInput().should('not.be.visible');
  });

  describe('when user selects the currency is NOT the same as Supply Contract currency', () => {
    it('should render additional form fields and validation errors without leaving the page', () => {
      goToPage(deal);
      pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();

      pages.loanFinancialDetails.currencyInput().should('be.visible');
      pages.loanFinancialDetails.currencyInputErrorMessage().should('be.visible');

      pages.loanFinancialDetails.conversionRateInput().should('be.visible');
      pages.loanFinancialDetails.conversionRateInputErrorMessage().should('be.visible');

      pages.loanFinancialDetails.conversionRateDateDayInput().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateMonthInput().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateYearInput().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');
    });

    it('should render additional form fields and validation errors when returning to the page', () => {
      goToPage(deal);
      pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();
      pages.loanFinancialDetails.submit().click();

      partials.loanProgressNav.progressNavLinkLoanFinancialDetails().click();
      cy.url().should('include', '/financial-details');

      const TOTAL_REQUIRED_FORM_FIELDS = 6;

      partials.errorSummary.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.loanFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.interestMarginFeeInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');

      pages.loanFinancialDetails.currencyInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.conversionRateInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');
    });
  });

  it('should prepopulate form inputs from submitted data and render a checked checkbox only for `Financial Details` in progress nav', () => {
    goToPageWithUnconditionalFacilityStage(deal);

    fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
    pages.loanFinancialDetails.submit().click();

    partials.loanProgressNav.progressNavLoanFinancialDetailsCompletedCheckbox().should('be.visible');
    partials.loanProgressNav.progressNavLoanFinancialDetailsCompletedCheckbox().should('be.checked');

    partials.loanProgressNav.progressNavLinkLoanFinancialDetails().click();

    assertLoanFormValues.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
  });

  describe('when changing the `interestMarginFee` field', () => {
    it('should dynamically update the `Guarantee Fee Payable By Bank` value on blur', () => {
      let interestMarginFee = '20';
      pages.loanFinancialDetails.guaranteeFeePayableByBankInput().invoke('attr', 'placeholder').should('eq', '0');
      pages.loanFinancialDetails.interestMarginFeeInput().type(interestMarginFee).blur();
      pages.loanFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(interestMarginFee));

      pages.loanFinancialDetails.interestMarginFeeInput().clear();
      interestMarginFee = '9.09';
      pages.loanFinancialDetails.interestMarginFeeInput().type(interestMarginFee).blur();
      pages.loanFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(interestMarginFee));
    });
  });

  describe('when changing the `facilityValue` or `coverePercentage` field', () => {
    it('should dynamically update the `UKEF exposure` value on blur', () => {
      goToPage(deal);

      pages.loanFinancialDetails.ukefExposureInput().invoke('attr', 'placeholder').should('eq', '0.00');

      let facilityValue = '100';
      const coveredPercentage = '10';

      pages.loanFinancialDetails.facilityValueInput().type(facilityValue);
      pages.loanFinancialDetails.coveredPercentageInput().type(coveredPercentage).blur();

      pages.loanFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(facilityValue, coveredPercentage));

      pages.loanFinancialDetails.facilityValueInput().clear();

      facilityValue = '250';
      pages.loanFinancialDetails.facilityValueInput().type(facilityValue).blur();
      pages.loanFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(facilityValue, coveredPercentage));
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Loan Financial Details` page', () => {
      goToPageWithUnconditionalFacilityStage(deal);

      fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();

      partials.loanProgressNav.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        pages.loanFinancialDetails.saveGoBackButton().click();

        cy.url().should('not.include', '/financial-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.bankReferenceNumber().click();
        partials.loanProgressNav.progressNavLinkLoanFinancialDetails().click();
        cy.url().should('include', '/loan/');
        cy.url().should('include', '/financial-details');

        assertLoanFormValues.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
      });
    });
  });
});
