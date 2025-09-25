import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format, differenceInMonths } from 'date-fns';
import { D_MMMM_YYYY_FORMAT, DD_MMM_YYYY_FORMAT, twoDays, today, tomorrow } from '@ukef/dtfs2-common/test-helpers';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import caseDealPage from '../../../../../../../../tfm/cypress/e2e/pages/caseDealPage';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';
import facilitiesPage from '../../../../../../../../tfm/cypress/e2e/pages/facilitiesPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE = '20000';

const tenor = differenceInMonths(new Date(mockFacility.coverEndDate), new Date()) + 1; // +1 to include the current month
const coverEndDateFormatted = format(new Date(mockFacility.coverEndDate), D_MMMM_YYYY_FORMAT);

const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(mockFacility.value, true)}`;
const exposure = mockFacility.value * 0.8; // 80% exposure
const formattedExposureWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(exposure, true)}`;

context('Amendments - TFM - TFM should display the original facilities value when a portal amendment has a future effective date', () => {
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
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          coverEndDateExists: true,
          changedCoverEndDate: twoDays.date,
          applicationDetailsUrl,
          facilityId,
          dealId,
          effectiveDate: tomorrow.date,
        });
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

  it('should display the original facility value on facility summary list', () => {
    caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(formattedExposureWithCurrency);

    cy.visit(tfmFacilityPage);

    facilityPage.facilityValueExportCurrency().contains(formattedValueWithCurrency);
    facilityPage.facilityValueGbp().contains(formattedValueWithCurrency);
    facilityPage.facilityMaximumUkefExposure().contains(`${formattedExposureWithCurrency} as at ${today.d_MMMM_yyyy}`);
  });

  it('should display the original facility coverEndDate and tenor on facility summary list', () => {
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(coverEndDateFormatted);
    caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(`${tenor} months`);

    cy.visit(tfmFacilityPage);

    facilityPage.facilityCoverEndDate().contains(coverEndDateFormatted);
    facilityPage.facilityTenor().contains(`${tenor} months`);
  });

  it('should show the original value and coverEndDate on the all facilities page', () => {
    const formattedValueWithCurrencyNoDecimalPlaces = `${CURRENCY.GBP} ${getFormattedMonetaryValue(mockFacility.value, false)}`;
    const coverEndDateFormattedAllFacilities = format(new Date(mockFacility.coverEndDate), DD_MMM_YYYY_FORMAT);

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    facilityPage.allFacilitiesLink().click();

    cy.assertText(facilitiesPage.facilitiesTable.row(facilityId).value(), formattedValueWithCurrencyNoDecimalPlaces);
    cy.assertText(facilitiesPage.facilitiesTable.row(facilityId).coverEndDate(), coverEndDateFormattedAllFacilities);
  });
});
