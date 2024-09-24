const pages = require('../../pages');
const partials = require('../../partials');
const fillLoanForm = require('./fill-loan-forms');
const assertLoanFormValues = require('./assert-loan-form-values');
const { calculateExpectedGuaranteeFee, calculateExpectedUkefExposure } = require('../../../support/portal/sectionCalculations');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;

const goToPageWithUnconditionalFacilityStage = () => {
  cy.loginGoToDealPage(BANK1_MAKER1);
  cy.clickAddLoanButton();

  pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
  cy.clickSubmitButton();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/financial-details');
};

const goToPage = () => {
  cy.loginGoToDealPage(BANK1_MAKER1);
  cy.clickAddLoanButton();
  partials.taskListHeader.itemLink('loan-financial-details').click();

  cy.url().should('include', '/loan/');
  cy.url().should('include', '/financial-details');
};

context('Loan Financial Details', () => {
  beforeEach(() => {
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal({});
  });

  describe('Loan financial details title', () => {
    it('should contain the correct title', () => {
      goToPageWithUnconditionalFacilityStage();

      pages.loanFinancialDetails.title().contains('Add loan financial details');
    });
  });

  describe('when submitting an empty form', () => {
    it('should progress to `Loan Dates and Repayments` page and after proceeding to `Loan Preview` page, should render validation errors in `Loan Financial Details` page', () => {
      goToPageWithUnconditionalFacilityStage();

      partials.errorSummaryLinks().should('have.length', 0);
      cy.clickSubmitButton();

      cy.url().should('include', '/loan/');
      cy.url().should('include', '/dates-repayments');
      cy.clickSubmitButton();
      cy.url().should('include', '/check-your-answers');
      partials.taskListHeader.itemLink('loan-financial-details').click();

      partials.errorSummaryLinks().should('have.length', 5);
      pages.loanFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.disbursementAmountInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.interestMarginFeeInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');
    });
  });

  it('should only render the disbursementAmount field when the facilityStage is `Unconditional`', () => {
    goToPageWithUnconditionalFacilityStage();

    pages.loanFinancialDetails.disbursementAmountInput().should('be.visible');

    partials.taskListHeader.itemLink('loan-guarantee-details').click();
    pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
    cy.clickSubmitButton();

    cy.url().should('include', '/financial-details');

    pages.loanFinancialDetails.disbursementAmountInput().should('not.exist');
  });

  describe('when user selects the currency is NOT the same as Supply Contract currency', () => {
    it('should render additional form fields', () => {
      goToPage();
      pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();

      pages.loanFinancialDetails.currencyInput().should('be.visible');

      pages.loanFinancialDetails.conversionRateInput().should('be.visible');

      pages.loanFinancialDetails.conversionRateDateDayInput().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateMonthInput().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateYearInput().should('be.visible');
    });

    it('should render additional form fields and validation errors when returning to the page', () => {
      goToPage();
      pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();
      cy.clickSubmitButton();

      partials.taskListHeader.itemLink('loan-financial-details').click();
      cy.url().should('include', '/financial-details');

      const TOTAL_REQUIRED_FORM_FIELDS = 6;

      partials.errorSummaryLinks().should('have.length', TOTAL_REQUIRED_FORM_FIELDS);

      pages.loanFinancialDetails.facilityValueInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.interestMarginFeeInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.coveredPercentageInputErrorMessage().should('be.visible');

      pages.loanFinancialDetails.currencyInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.conversionRateInputErrorMessage().should('be.visible');
      pages.loanFinancialDetails.conversionRateDateInputErrorMessage().should('be.visible');
    });
  });

  it('should prepopulate form inputs from submitted data and render a `completed` status tag in task list header', () => {
    goToPageWithUnconditionalFacilityStage();

    fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
    cy.clickSubmitButton();

    cy.assertText(partials.taskListHeader.itemStatus('loan-financial-details'), 'Completed');

    partials.taskListHeader.itemLink('loan-financial-details').click();

    assertLoanFormValues.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
  });

  describe('when changing the `interestMarginFee` field', () => {
    it('should dynamically update the `Guarantee Fee Payable By Bank` value on blur', () => {
      goToPageWithUnconditionalFacilityStage();

      let interestMarginFee = '20';
      pages.loanFinancialDetails.guaranteeFeePayableByBankInput().invoke('attr', 'placeholder').should('eq', '0');
      cy.keyboardInput(pages.loanFinancialDetails.interestMarginFeeInput(), interestMarginFee);

      pages.loanFinancialDetails.interestMarginFeeInput().blur();

      pages.loanFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(interestMarginFee));

      pages.loanFinancialDetails.interestMarginFeeInput().clear();
      interestMarginFee = '9.09';
      cy.keyboardInput(pages.loanFinancialDetails.interestMarginFeeInput(), interestMarginFee);

      pages.loanFinancialDetails.interestMarginFeeInput().blur();

      pages.loanFinancialDetails.guaranteeFeePayableByBankInput().should('have.value', calculateExpectedGuaranteeFee(interestMarginFee));
    });
  });

  describe('when changing the `value` or `coveredPercentage` field', () => {
    it('should dynamically update the `UKEF exposure` value on blur', () => {
      goToPage();

      pages.loanFinancialDetails.ukefExposureInput().invoke('attr', 'placeholder').should('eq', '0.00');

      let value = '100';
      const coveredPercentage = '10';

      cy.keyboardInput(pages.loanFinancialDetails.facilityValueInput(), value);
      cy.keyboardInput(pages.loanFinancialDetails.coveredPercentageInput(), coveredPercentage);

      pages.loanFinancialDetails.coveredPercentageInput().blur();

      pages.loanFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(value, coveredPercentage));

      pages.loanFinancialDetails.facilityValueInput().clear();

      value = '250';
      cy.keyboardInput(pages.loanFinancialDetails.facilityValueInput(), value);

      pages.loanFinancialDetails.facilityValueInput().blur();

      pages.loanFinancialDetails.ukefExposureInput().should('have.value', calculateExpectedUkefExposure(value, coveredPercentage));
    });
  });

  describe('When a user clicks `save and go back` button', () => {
    it('should save the form data, return to Deal page and prepopulate form fields when returning back to `Loan Financial Details` page', () => {
      goToPageWithUnconditionalFacilityStage();

      fillLoanForm.financialDetails.currencyNotTheSameAsSupplyContractCurrency();

      partials.taskListHeader.loanId().then((loanIdHiddenInput) => {
        const loanId = loanIdHiddenInput[0].value;

        cy.clickSaveGoBackButton();

        cy.url().should('not.include', '/financial-details');
        cy.url().should('include', '/contract');

        const row = pages.contract.loansTransactionsTable.row(loanId);

        row.nameLink().click();
        partials.taskListHeader.itemLink('loan-financial-details').click();
        cy.url().should('include', '/loan/');
        cy.url().should('include', '/financial-details');

        assertLoanFormValues.financialDetails.currencyNotTheSameAsSupplyContractCurrency();
      });
    });
  });
});
