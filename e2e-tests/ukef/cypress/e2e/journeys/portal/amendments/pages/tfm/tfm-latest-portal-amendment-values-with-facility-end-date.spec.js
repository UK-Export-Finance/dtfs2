import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format, differenceInMonths } from 'date-fns';
import { D_MMMM_YYYY_FORMAT, tomorrow, today } from '@ukef/dtfs2-common/test-helpers';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - TFM - Latest values for portal amendment - Facility End Date', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let tfmDealPage;
  let tfmFacilityPage;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;

        tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        tfmFacilityPage = `${TFM_URL}/case/${dealId}/facility/${facilityId}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          coverEndDateExists: true,
          changedCoverEndDate: tomorrow.date,
          facilityEndDateExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);
        cy.visit(tfmDealPage);
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);
    cy.visit(tfmFacilityPage);
  });

  it('should display the latest amended values on facility summary list', () => {
    const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, true)}`;
    const tenor = differenceInMonths(new Date(tomorrow.date), new Date()) + 1; // +1 to include the current month
    const coverEndDateFormatted = format(new Date(tomorrow.date), D_MMMM_YYYY_FORMAT);
    const facilityEndDateFormatted = format(new Date(today.date), D_MMMM_YYYY_FORMAT);

    facilityPage.facilityCoverEndDate().contains(coverEndDateFormatted);
    facilityPage.facilityTenor().contains(`${tenor} month`);
    facilityPage.facilityFacilityEndDate().contains(facilityEndDateFormatted);
    facilityPage.facilityValueGbp().contains(formattedValueWithCurrency);
  });
});
