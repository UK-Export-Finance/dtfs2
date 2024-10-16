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

    cy.completeDateFormFields({
      idPrefix: 'requestedCoverStartDate',
      day: LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay,
      month: LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth,
      year: LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear,
    });

    cy.completeDateFormFields({
      idPrefix: 'coverEndDate',
      day: LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay,
      month: LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth,
      year: LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear,
    });
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

    cy.completeDateFormFields({
      idPrefix: 'conversionRateDate',
      day: LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay,
      month: LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth,
      year: LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear,
    });

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
