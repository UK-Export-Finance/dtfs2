import portalPages from '../../../../../../../portal/cypress/integration/pages';

const moment = require('moment');

const ISSUED_BOND_DATE_VALUE = moment();
export const COVER_START_DATE_VALUE = moment().add(2, 'day');
export const COVER_END_DATE_VALUE = moment().add(1, 'month');

export const fillAndSubmitIssueBondFacilityForm = () => {
  portalPages.bondIssueFacility.issuedDateDayInput().type(ISSUED_BOND_DATE_VALUE.format('DD'));
  portalPages.bondIssueFacility.issuedDateMonthInput().type(ISSUED_BOND_DATE_VALUE.format('MM'));
  portalPages.bondIssueFacility.issuedDateYearInput().type(ISSUED_BOND_DATE_VALUE.format('YYYY'));

  portalPages.bondIssueFacility.requestedCoverStartDateDayInput().clear();
  portalPages.bondIssueFacility.requestedCoverStartDateDayInput().type(COVER_START_DATE_VALUE.format('DD'));

  portalPages.bondIssueFacility.requestedCoverStartDateMonthInput().clear();
  portalPages.bondIssueFacility.requestedCoverStartDateMonthInput().type(COVER_START_DATE_VALUE.format('MM'));

  portalPages.bondIssueFacility.requestedCoverStartDateYearInput().clear();
  portalPages.bondIssueFacility.requestedCoverStartDateYearInput().type(COVER_START_DATE_VALUE.format('YYYY'));

  portalPages.bondIssueFacility.coverEndDateDayInput().type(COVER_END_DATE_VALUE.format('DD'));
  portalPages.bondIssueFacility.coverEndDateMonthInput().type(COVER_END_DATE_VALUE.format('MM'));
  portalPages.bondIssueFacility.coverEndDateYearInput().type(COVER_END_DATE_VALUE.format('YYYY'));

  portalPages.bondIssueFacility.submit().click();
};
