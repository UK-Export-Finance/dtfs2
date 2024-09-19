const pages = require('../../pages');
const LOAN_FORM_VALUES = require('./loan-form-values');

const guaranteeDetails = {
  facilityStageConditional: () => {
    pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
    cy.keyboardInput(pages.loanGuaranteeDetails.conditionalNameInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);
    cy.keyboardInput(pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
  },
  facilityStageUnconditional: () => {
    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
    pages.loanGuaranteeDetails.unconditionalNameInput().clear();
    cy.keyboardInput(pages.loanGuaranteeDetails.unconditionalNameInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

    cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateDayInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    cy.keyboardInput(pages.loanGuaranteeDetails.requestedCoverStartDateYearInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateDayInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateMonthInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    cy.keyboardInput(pages.loanGuaranteeDetails.coverEndDateYearInput(), LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);
  },
};

const financialDetails = {
  currencySameAsSupplyContractCurrency: () => {
    cy.keyboardInput(pages.loanFinancialDetails.facilityValueInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputYes().click();
    cy.keyboardInput(pages.loanFinancialDetails.interestMarginFeeInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    cy.keyboardInput(pages.loanFinancialDetails.coveredPercentageInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    cy.keyboardInput(pages.loanFinancialDetails.minimumQuarterlyFeeInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
  currencyNotTheSameAsSupplyContractCurrency: () => {
    cy.keyboardInput(pages.loanFinancialDetails.facilityValueInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();
    pages.loanFinancialDetails.currencyInput().select(LOAN_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
    cy.keyboardInput(pages.loanFinancialDetails.conversionRateInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
    cy.keyboardInput(pages.loanFinancialDetails.conversionRateDateDayInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay);
    cy.keyboardInput(pages.loanFinancialDetails.conversionRateDateMonthInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth);
    cy.keyboardInput(pages.loanFinancialDetails.conversionRateDateYearInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear);
    cy.keyboardInput(pages.loanFinancialDetails.disbursementAmountInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
    cy.keyboardInput(pages.loanFinancialDetails.interestMarginFeeInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    cy.keyboardInput(pages.loanFinancialDetails.coveredPercentageInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    cy.keyboardInput(pages.loanFinancialDetails.minimumQuarterlyFeeInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
};

const unconditionalWithCurrencySameAsSupplyContractCurrency = () => {
  guaranteeDetails.facilityStageUnconditional();
  cy.clickSubmitButton();

  financialDetails.currencySameAsSupplyContractCurrency();
  cy.keyboardInput(pages.loanFinancialDetails.disbursementAmountInput(), LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
  cy.clickSubmitButton();
};

const unconditionalWithCurrencyNotTheSameAsSupplyContractCurrency = () => {
  guaranteeDetails.facilityStageUnconditional();
  cy.clickSubmitButton();

  financialDetails.currencyNotTheSameAsSupplyContractCurrency();
  cy.clickSubmitButton();
};

const datesRepayments = {
  inAdvanceAnnually: () => {
    pages.loanDatesRepayments.premiumTypeInAdvanceInput().click();
    pages.loanDatesRepayments.premiumFrequencyAnnuallyInput().click();
    pages.loanDatesRepayments.dayCountBasis365Input().click();
  },
  inArrearQuarterly: () => {
    pages.loanDatesRepayments.premiumTypeInArrearInput().click();
    pages.loanDatesRepayments.premiumFrequencyQuarterlyInput().click();
    pages.loanDatesRepayments.dayCountBasis365Input().click();
  },
};

module.exports = {
  guaranteeDetails,
  financialDetails,
  unconditionalWithCurrencySameAsSupplyContractCurrency,
  unconditionalWithCurrencyNotTheSameAsSupplyContractCurrency,
  datesRepayments,
};
