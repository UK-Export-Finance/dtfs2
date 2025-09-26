import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format, differenceInMonths } from 'date-fns';
import { D_MMMM_YYYY_FORMAT, DD_MMM_YYYY_FORMAT, twoYears, twoDays, today } from '@ukef/dtfs2-common/test-helpers';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import caseDealPage from '../../../../../../../../tfm/cypress/e2e/pages/caseDealPage';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';
import facilitiesPage from '../../../../../../../../tfm/cypress/e2e/pages/facilitiesPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const mockFacility2 = {
  ...mockFacility,
  ukefFacilityId: '10000013',
};

const CHANGED_FACILITY_VALUE = '20000';
const CHANGE_FACILITY_VALUE_2 = '30000';

context('Amendments - TFM - TFM should display single value and single cover end date amendments', () => {
  let dealId;
  let facilityId1;
  let facilityId2;
  let applicationDetailsUrl;
  let tfmDealPage;
  let tfmFacilityPage1;
  let tfmFacilityPage2;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId1 = createdFacility.details._id;
      });

      cy.createGefFacilities(dealId, [mockFacility2], BANK1_MAKER1).then((createdFacility) => {
        facilityId2 = createdFacility.details._id;

        tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        tfmFacilityPage1 = `${TFM_URL}/case/${dealId}/facility/${facilityId1}`;
        tfmFacilityPage2 = `${TFM_URL}/case/${dealId}/facility/${facilityId2}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          applicationDetailsUrl,
          facilityId: facilityId1,
          dealId,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGE_FACILITY_VALUE_2,
          applicationDetailsUrl,
          facilityId: facilityId1,
          dealId,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: false,
          coverEndDateExists: true,
          changedCoverEndDate: twoDays.date,
          applicationDetailsUrl,
          facilityId: facilityId2,
          dealId,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: false,
          coverEndDateExists: true,
          changedCoverEndDate: twoYears.date,
          applicationDetailsUrl,
          facilityId: facilityId2,
          dealId,
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

  it('should display the updated amendment value on facility summary list for the facility value amendment', () => {
    const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGE_FACILITY_VALUE_2, true)}`;
    const exposure = CHANGE_FACILITY_VALUE_2 * 0.8; // 80% exposure
    const formattedExposureWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(exposure, true)}`;

    caseDealPage.dealFacilitiesTable.row(facilityId1).exportCurrency().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId1).valueGBP().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId1).exposure().contains(formattedExposureWithCurrency);

    cy.visit(tfmFacilityPage1);

    facilityPage.facilityValueExportCurrency().contains(formattedValueWithCurrency);
    facilityPage.facilityValueGbp().contains(formattedValueWithCurrency);
    facilityPage.facilityMaximumUkefExposure().contains(`${formattedExposureWithCurrency} as at ${today.d_MMMM_yyyy}`);
  });

  it('should display the updated amendment value and original cover end date on the All facilities page for the facility', () => {
    const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGE_FACILITY_VALUE_2, true)}`;
    const coverEndDateFormatted = format(new Date(mockFacility.coverEndDate), DD_MMM_YYYY_FORMAT);

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    facilityPage.allFacilitiesLink().click();

    cy.assertText(facilitiesPage.facilitiesTable.row(facilityId1).value(), formattedValueWithCurrency);
    cy.assertText(facilitiesPage.facilitiesTable.row(facilityId1).coverEndDate(), coverEndDateFormatted);
  });

  it('should display the original facility coverEndDate and tenor on facility summary list for the facility value amendment', () => {
    const tenor = differenceInMonths(new Date(mockFacility.coverEndDate), new Date()) + 1; // +1 to include the current month
    const coverEndDateFormatted = format(new Date(mockFacility.coverEndDate), D_MMMM_YYYY_FORMAT);

    caseDealPage.dealFacilitiesTable.row(facilityId1).facilityCoverEndDate().contains(coverEndDateFormatted);
    caseDealPage.dealFacilitiesTable.row(facilityId1).facilityTenor().contains(`${tenor} months`);

    cy.visit(tfmFacilityPage1);

    facilityPage.facilityCoverEndDate().contains(coverEndDateFormatted);
    facilityPage.facilityTenor().contains(`${tenor} months`);
  });

  it('should display the updated coverEndDate on facility summary list for the cover end date amendment', () => {
    const coverEndDateFormatted = format(new Date(twoYears.date), D_MMMM_YYYY_FORMAT);
    const tenor = differenceInMonths(new Date(twoYears.date), new Date()) + 1; // +1 to include the current month

    caseDealPage.dealFacilitiesTable.row(facilityId2).facilityCoverEndDate().contains(coverEndDateFormatted);
    caseDealPage.dealFacilitiesTable.row(facilityId2).facilityTenor().contains(`${tenor} months`);

    cy.visit(tfmFacilityPage2);

    facilityPage.facilityCoverEndDate().contains(coverEndDateFormatted);
    facilityPage.facilityTenor().contains(`${tenor} months`);
  });

  it('should display the original facility value on facility summary list for the cover end date amendment', () => {
    const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(mockFacility2.value, true)}`;
    const exposure = mockFacility2.value * 0.8; // 80% exposure
    const formattedExposureWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(exposure, true)}`;

    caseDealPage.dealFacilitiesTable.row(facilityId2).exportCurrency().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId2).valueGBP().contains(formattedValueWithCurrency);
    caseDealPage.dealFacilitiesTable.row(facilityId2).exposure().contains(formattedExposureWithCurrency);

    cy.visit(tfmFacilityPage2);

    facilityPage.facilityValueExportCurrency().contains(formattedValueWithCurrency);
    facilityPage.facilityValueGbp().contains(formattedValueWithCurrency);
    facilityPage.facilityMaximumUkefExposure().contains(`${formattedExposureWithCurrency} as at ${today.d_MMMM_yyyy}`);
  });

  it('should display the original value and updated cover end date on the All facilities page for the facility', () => {
    const formattedValueWithCurrency = `${CURRENCY.GBP} ${getFormattedMonetaryValue(mockFacility2.value, false)}`;
    const coverEndDateFormatted = format(new Date(twoYears.date), DD_MMM_YYYY_FORMAT);

    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);

    facilityPage.allFacilitiesLink().click();

    cy.assertText(facilitiesPage.facilitiesTable.row(facilityId2).value(), formattedValueWithCurrency);
    cy.assertText(facilitiesPage.facilitiesTable.row(facilityId2).coverEndDate(), coverEndDateFormatted);
  });
});
