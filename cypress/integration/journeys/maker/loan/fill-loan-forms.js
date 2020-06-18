const pages = require('../../../pages');
const LOAN_FORM_VALUES = require('./loan-form-values');

const guaranteeDetails = {
  facilityStageConditional: () => {
    pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
    pages.loanGuaranteeDetails.conditionalBankReferenceNumberInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);
    pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
  },
  facilityStageUnconditional: () => {
    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
    pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().clear();
    pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);

    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    pages.loanGuaranteeDetails.coverEndDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    pages.loanGuaranteeDetails.coverEndDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);
  },
};

const financialDetails = {
  currencySameAsSupplyContractCurrency: () => {
    pages.loanFinancialDetails.facilityValueInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.facilityValue);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputYes().click();
    pages.loanFinancialDetails.interestMarginFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    pages.loanFinancialDetails.coveredPercentageInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.loanFinancialDetails.minimumQuarterlyFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
  currencyNotTheSameAsSupplyContractCurrency: () => {
    pages.loanFinancialDetails.facilityValueInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.facilityValue);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();
    pages.loanFinancialDetails.currencyInput().select(LOAN_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
    pages.loanFinancialDetails.conversionRateInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
    pages.loanFinancialDetails.conversionRateDateDayInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay);
    pages.loanFinancialDetails.conversionRateDateMonthInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth);
    pages.loanFinancialDetails.conversionRateDateYearInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear);
    pages.loanFinancialDetails.disbursementAmountInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
    pages.loanFinancialDetails.interestMarginFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    pages.loanFinancialDetails.coveredPercentageInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.loanFinancialDetails.minimumQuarterlyFeeInput().type(LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
};

module.exports = {
  guaranteeDetails,
  financialDetails,
};
