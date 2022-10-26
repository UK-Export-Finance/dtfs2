const pages = require('../../../pages');
const LOAN_FORM_VALUES = require('./loan-form-values');

const guaranteeDetails = {
  facilityStageConditional: () => {
    pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
    pages.loanGuaranteeDetails.conditionalNameInput()
      .type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);
    pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput()
      .type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
  },
  facilityStageUnconditional: () => {
    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
    pages.loanGuaranteeDetails.unconditionalNameInput().clear();
    pages.loanGuaranteeDetails.unconditionalNameInput()
      .type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput()
      .type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput()
      .type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput()
      .type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    pages.loanGuaranteeDetails.coverEndDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    pages.loanGuaranteeDetails.coverEndDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);
  },
};

const financialDetails = {
  currencySameAsSupplyContractCurrency: () => {
    pages.loanFinancialDetails.facilityValueInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputYes().click();
    pages.loanFinancialDetails.interestMarginFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    pages.loanFinancialDetails.coveredPercentageInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.loanFinancialDetails.minimumQuarterlyFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
  currencyNotTheSameAsSupplyContractCurrency: () => {
    pages.loanFinancialDetails.facilityValueInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.value);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();
    pages.loanFinancialDetails.currencyInput().select(LOAN_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
    pages.loanFinancialDetails.conversionRateInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
    pages.loanFinancialDetails.conversionRateDateDayInput()
      .type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay);
    pages.loanFinancialDetails.conversionRateDateMonthInput()
      .type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth);
    pages.loanFinancialDetails.conversionRateDateYearInput()
      .type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear);
    pages.loanFinancialDetails.disbursementAmountInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
    pages.loanFinancialDetails.interestMarginFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    pages.loanFinancialDetails.coveredPercentageInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.loanFinancialDetails.minimumQuarterlyFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
};

const unconditionalWithCurrencySameAsSupplyContractCurrency = () => {
  guaranteeDetails.facilityStageUnconditional();
  pages.loanGuaranteeDetails.submit().click();

  financialDetails.currencySameAsSupplyContractCurrency();
  pages.loanFinancialDetails.disbursementAmountInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
  pages.loanFinancialDetails.submit().click();
};

const unconditionalWithCurrencyNotTheSameAsSupplyContractCurrency = () => {
  guaranteeDetails.facilityStageUnconditional();
  pages.loanGuaranteeDetails.submit().click();

  financialDetails.currencyNotTheSameAsSupplyContractCurrency();
  pages.loanFinancialDetails.submit().click();
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
