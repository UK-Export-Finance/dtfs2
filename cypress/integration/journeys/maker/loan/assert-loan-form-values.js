const pages = require('../../../pages');
const LOAN_FORM_VALUES = require('./loan-form-values');

const guaranteeDetails = {
  facilityStageConditional: () => {
    pages.loanGuaranteeDetails.facilityStageConditionalInput().should('be.checked');
    pages.loanGuaranteeDetails.conditionalBankReferenceNumberInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);
    pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
  },
  facilityStageUnconditional: () => {
    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().should('be.checked');

    pages.loanGuaranteeDetails.unconditionalBankReferenceNumberInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);

    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    pages.loanGuaranteeDetails.coverEndDateDayInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    pages.loanGuaranteeDetails.coverEndDateYearInput().should('have.value', LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);
  },
};

module.exports = {
  guaranteeDetails,
};
