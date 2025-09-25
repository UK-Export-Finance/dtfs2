import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format, differenceInMonths } from 'date-fns';
import { D_MMMM_YYYY_FORMAT, DD_MMM_YYYY_FORMAT, twoDays, today, tomorrow, twoYears } from '@ukef/dtfs2-common/test-helpers';
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
const CHANGED_FACILITY_VALUE_2 = '30000';

const tenor = differenceInMonths(new Date(twoDays.date), new Date()) + 1; // +1 to include the current month
const coverEndDateFormatted = format(new Date(twoDays.date), D_MMMM_YYYY_FORMAT);

const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, true)}`;
const exposure = CHANGED_FACILITY_VALUE * 0.8; // 80% exposure
const formattedExposureWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(exposure, true)}`;

context(
  'Amendments - TFM - TFM should display the amendment with current effective values when the latest portal amendment has a future effective date',
  () => {
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
          });

          cy.loginAndSubmitPortalAmendmentRequestToUkef({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE_2,
            coverEndDateExists: true,
            changedCoverEndDate: twoYears.date,
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

    it('should display the first amendment facility value on facility summary list', () => {
      caseDealPage.dealFacilitiesTable.row(facilityId).exportCurrency().contains(formattedValueWithCurrency);
      caseDealPage.dealFacilitiesTable.row(facilityId).valueGBP().contains(formattedValueWithCurrency);
      caseDealPage.dealFacilitiesTable.row(facilityId).exposure().contains(formattedExposureWithCurrency);

      cy.visit(tfmFacilityPage);

      facilityPage.facilityValueExportCurrency().contains(formattedValueWithCurrency);
      facilityPage.facilityValueGbp().contains(formattedValueWithCurrency);
      facilityPage.facilityMaximumUkefExposure().contains(`${formattedExposureWithCurrency} as at ${today.d_MMMM_yyyy}`);
    });

    it('should display the first amendment facility coverEndDate and tenor on facility summary list', () => {
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityCoverEndDate().contains(coverEndDateFormatted);
      caseDealPage.dealFacilitiesTable.row(facilityId).facilityTenor().contains(`${tenor} month`);

      cy.visit(tfmFacilityPage);

      facilityPage.facilityCoverEndDate().contains(coverEndDateFormatted);
      facilityPage.facilityTenor().contains(`${tenor} month`);
    });

    it('should show the first amendment value and coverEndDate on the all facilities page', () => {
      const coverEndDateFormattedAllFacilities = format(new Date(twoDays.date), DD_MMM_YYYY_FORMAT);

      cy.visit(TFM_URL);

      cy.tfmLogin(PIM_USER_1);

      facilityPage.allFacilitiesLink().click();

      cy.assertText(facilitiesPage.facilitiesTable.row(facilityId).value(), formattedValueWithCurrency);
      cy.assertText(facilitiesPage.facilitiesTable.row(facilityId).coverEndDate(), coverEndDateFormattedAllFacilities);
    });
  },
);
