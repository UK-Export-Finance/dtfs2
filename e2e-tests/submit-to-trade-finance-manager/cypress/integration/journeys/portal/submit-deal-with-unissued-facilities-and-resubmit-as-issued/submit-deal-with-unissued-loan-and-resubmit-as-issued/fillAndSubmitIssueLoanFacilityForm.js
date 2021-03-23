import portalPages from '../../../../../../../portal/cypress/integration/pages';

const moment = require('moment');

const ISSUED_LOAN_DATE_VALUE = moment();
export const COVER_START_DATE_VALUE = moment().add(2, 'day');
export const COVER_END_DATE_VALUE = moment().add(1, 'month');
export const DISBURSEMENT_AMOUNT_VALUE = '50000';

export const fillAndSubmitIssueLoanFacilityForm = () => {
  portalPages.loanIssueFacility.issuedDateDayInput().type(ISSUED_LOAN_DATE_VALUE.format('DD'));
  portalPages.loanIssueFacility.issuedDateMonthInput().type(ISSUED_LOAN_DATE_VALUE.format('MM'));
  portalPages.loanIssueFacility.issuedDateYearInput().type(ISSUED_LOAN_DATE_VALUE.format('YYYY'));

  portalPages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  portalPages.loanIssueFacility.requestedCoverStartDateDayInput().type(COVER_START_DATE_VALUE.format('DD'));

  portalPages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  portalPages.loanIssueFacility.requestedCoverStartDateMonthInput().type(COVER_START_DATE_VALUE.format('MM'));

  portalPages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  portalPages.loanIssueFacility.requestedCoverStartDateYearInput().type(COVER_START_DATE_VALUE.format('YYYY'));

  portalPages.loanIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.format('DD'));
  portalPages.loanIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.format('MM'));
  portalPages.loanIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.format('YYYY'));

  portalPages.loanIssueFacility.disbursementAmount().type(DISBURSEMENT_AMOUNT_VALUE);
  portalPages.loanIssueFacility.bankReferenceNumber().type('5678');

  portalPages.loanIssueFacility.submit().click();
};
