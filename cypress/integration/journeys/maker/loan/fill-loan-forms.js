const pages = require('../../../pages');
const LOAN_FORM_VALUES = require('./loan-form-values');

const guaranteeDetails = {
  facilityStageConditional: () => {
    pages.loanGuaranteeDetails.facilityStageConditionalInput().click();
    pages.loanGuaranteeDetails.ukefGuaranteeInMonthsInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.ukefGuaranteeInMonths);
  },
  facilityStageUnconditional: () => {
    pages.loanGuaranteeDetails.facilityStageUnconditionalInput().click();
    pages.loanGuaranteeDetails.bankReferenceNumberInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.bankReferenceNumber);

    pages.loanGuaranteeDetails.requestedCoverStartDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateDay);
    pages.loanGuaranteeDetails.requestedCoverStartDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateMonth);
    pages.loanGuaranteeDetails.requestedCoverStartDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.requestedCoverStartDateYear);

    pages.loanGuaranteeDetails.coverEndDateDayInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateDay);
    pages.loanGuaranteeDetails.coverEndDateMonthInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateMonth);
    pages.loanGuaranteeDetails.coverEndDateYearInput().type(LOAN_FORM_VALUES.GUARANTEE_DETAILS.coverEndDateYear);
  },
};


module.exports = {
  guaranteeDetails,
};
