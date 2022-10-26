const pages = require('../../../pages');
const LOAN_FORM_VALUES = require('./loan-form-values');

const guaranteeDetails = {
  facilityStageConditional: () => {
    pages.loanGuaranteeDetails.facilityStageConditionalInput().should('be.checked');
    pages.loanGuaranteeDetails.conditionalNameInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);
    pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
  },
  facilityStageUnconditional: () => {
    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().should('be.checked');

    pages.loanGuaranteeDetails.unconditionalNameInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.name);

    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    pages.loanGuaranteeDetails.coverEndDateDayInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    pages.loanGuaranteeDetails.coverEndDateYearInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);
  },
};

const financialDetails = {
  currencyNotTheSameAsSupplyContractCurrency: () => {
    pages.loanFinancialDetails.facilityValueInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.valueFormatted);
    pages.loanFinancialDetails.currencySameAsSupplyContractCurrencyInputNo().click();
    pages.loanFinancialDetails.currencyInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.currency.value);
    pages.loanFinancialDetails.conversionRateInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRate);
    pages.loanFinancialDetails.conversionRateDateDayInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateDay);
    pages.loanFinancialDetails.conversionRateDateMonthInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateMonth);
    pages.loanFinancialDetails.conversionRateDateYearInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.conversionRateDateYear);
    pages.loanFinancialDetails.disbursementAmountInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.disbursementAmount);
    pages.loanFinancialDetails.interestMarginFeeInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.interestMarginFee);
    pages.loanFinancialDetails.coveredPercentageInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.coveredPercentage);
    pages.loanFinancialDetails.minimumQuarterlyFeeInput().should('have.value', LOAN_FORM_VALUES.FINANCIAL_DETAILS.minimumQuarterlyFee);
  },
};

module.exports = {
  guaranteeDetails,
  financialDetails,
};
