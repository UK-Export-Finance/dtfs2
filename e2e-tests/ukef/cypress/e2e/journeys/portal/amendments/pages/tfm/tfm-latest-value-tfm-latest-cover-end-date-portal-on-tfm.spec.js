import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format, differenceInMonths } from 'date-fns';
import { D_MMMM_YYYY_FORMAT, twoYears } from '../../../../../../../../e2e-fixtures/dateConstants';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import caseDealPage from '../../../../../../../../tfm/cypress/e2e/pages/caseDealPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - TFM - Latest cover end date on portal amendment and latest facility value on tfm amendment', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let tfmDealPage;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;

        tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          coverEndDateExists: true,
          changedCoverEndDate: twoYears.date,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);
        cy.visit(tfmDealPage);

        cy.submitTfmAmendment({ dealId, facilityId, facilityValue: CHANGED_FACILITY_VALUE });
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
    cy.visit(tfmDealPage);
  });

  it('should display the amended facility value on facility summary list for the tfm facility value amendment', () => {
    const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, true)}`;
    const exposure = CHANGED_FACILITY_VALUE * 0.8; // 80% exposure
    const formattedExposureWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(exposure, true)}`;

    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(formattedExposureWithCurrency);
  });

  it('should display the amended coverEndDate and tenor on facility summary list for the portal cover end date amendment', () => {
    const tenor = differenceInMonths(new Date(twoYears.date), new Date()) + 1; // +1 to include the current month
    const coverEndDateFormatted = format(new Date(twoYears.date), D_MMMM_YYYY_FORMAT);

    caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(coverEndDateFormatted);
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(`${tenor} months`);
  });
});
