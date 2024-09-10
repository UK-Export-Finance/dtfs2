import relative from '../../relativeURL';
import { errorSummary } from '../../partials';
import CONSTANTS from '../../../fixtures/constants';
import {
  today,
  threeDaysDay,
  threeDaysMonth,
  threeDaysYear,
  threeMonthsOneDayDay,
  threeMonthsOneDayYear,
  threeMonthsOneDayMonth,
} from '../../../../../e2e-fixtures/dateConstants';
import { MOCK_APPLICATION_AIN } from '../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR } from '../../../fixtures/mocks/mock-facilities';
import unissuedFacilityTable from '../../pages/unissued-facilities';
import applicationPreview from '../../pages/application-preview';
import aboutFacilityUnissued from '../../pages/unissued-facilities-about-facility';
import bankReviewDate from '../../pages/bank-review-date';

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

if (facilityEndDateEnabled) {
  context('Unissued Facilities - bank review date page', () => {
    let dealId;
    let token;
    let facilityOneId;

    before(() => {
      cy.apiLogin(BANK1_MAKER1)
        .then((t) => {
          token = t;
        })
        .then(() => {
          // creates application and inserts facilities and changes status
          cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
            dealId = body._id;
            cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN).then(() => {
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
                facilityOneId = facility.body.details._id;
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
              });
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO),
              );
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE),
              );
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR),
              );
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR),
              );
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR),
              );
              cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
                cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR),
              );
              cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
            });
          });
        });
    });

    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
    });

    describe('Visiting from unissued facilities page', () => {
      const getUnissuedFacilitiesUrl = () => relative(`/gef/application-details/${dealId}/unissued-facilities`);

      beforeEach(() => {
        cy.visit(getUnissuedFacilitiesUrl());
        unissuedFacilityTable.updateIndividualFacilityButton(0).click();

        aboutFacilityUnissued.issueDateDay().clear().type(threeDaysDay);
        aboutFacilityUnissued.issueDateMonth().clear().type(threeDaysMonth);
        aboutFacilityUnissued.issueDateYear().clear().type(threeDaysYear);

        aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
        aboutFacilityUnissued.coverStartDateDay().clear().type(threeDaysDay);
        aboutFacilityUnissued.coverStartDateMonth().clear().type(threeDaysMonth);
        aboutFacilityUnissued.coverStartDateYear().clear().type(threeDaysYear);

        aboutFacilityUnissued.coverEndDateDay().clear().type(threeMonthsOneDayDay);
        aboutFacilityUnissued.coverEndDateMonth().clear().type(threeMonthsOneDayMonth);
        aboutFacilityUnissued.coverEndDateYear().clear().type(threeMonthsOneDayYear);

        aboutFacilityUnissued.isUsingFacilityEndDateNo().click();

        cy.clickContinueButton();
      });

      it('should redirect user to the about unissued facility page when clicking back link', () => {
        const facilityOneBankReviewDateUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/bank-review-date`);
        cy.url().should('eq', facilityOneBankReviewDateUrl);

        cy.clickBackLink();

        const aboutUnissuedFacilityUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`);
        cy.url().should('eq', aboutUnissuedFacilityUrl);
      });

      it('should display an error message when the date is entered incorrectly & click continue', () => {
        bankReviewDate.bankReviewDateDay().clear().type('abcd');
        cy.clickContinueButton();

        errorSummary();
        bankReviewDate.bankReviewDateError();
      });

      it('should display an error message when the date is entered incorrectly & click save and return', () => {
        bankReviewDate.bankReviewDateDay().clear().type('abcd');
        cy.clickSaveAndReturnButton();

        errorSummary();
        bankReviewDate.bankReviewDateError();
      });

      it('should redirect user to the unissued facility page when clicking continue', () => {
        cy.fillInBankReviewDate(today);

        cy.clickContinueButton();

        cy.url().should('eq', getUnissuedFacilitiesUrl());
      });

      it('should redirect user to the unissued facility page when clicking save and return', () => {
        cy.fillInBankReviewDate(today);

        cy.clickSaveAndReturnButton();

        cy.url().should('eq', getUnissuedFacilitiesUrl());
      });
    });

    describe('Visiting from application preview page', () => {
      const getApplicationDetailsUrl = () => relative(`/gef/application-details/${dealId}`);

      beforeEach(() => {
        cy.visit(getApplicationDetailsUrl());
        applicationPreview.facilitySummaryListTable(6).bankReviewDateAction().click();
      });

      it('should redirect user to the about unissued facility page when clicking back link', () => {
        const facilityOneChangeBankReviewDateUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/bank-review-date/change`);
        cy.url().should('eq', facilityOneChangeBankReviewDateUrl);

        cy.clickBackLink();

        const facilityOneChangeUnissuedFacilityUrl = relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`);
        cy.url().should('eq', facilityOneChangeUnissuedFacilityUrl);
      });

      it('should display an error message when the date is entered incorrectly & click continue', () => {
        bankReviewDate.bankReviewDateDay().clear().type('abcd');
        cy.clickContinueButton();

        errorSummary();
        bankReviewDate.bankReviewDateError();
      });

      it('should display an error message when the date is entered incorrectly & click saveAndReturn', () => {
        bankReviewDate.bankReviewDateDay().clear().type('abcd');
        cy.clickSaveAndReturnButton();

        errorSummary();
        bankReviewDate.bankReviewDateError();
      });

      it('should redirect user to the application details page when clicking continue', () => {
        cy.fillInBankReviewDate(today);
        cy.clickContinueButton();

        cy.url().should('eq', getApplicationDetailsUrl());
      });

      it('should redirect user to the application details page when clicking save and return', () => {
        cy.fillInBankReviewDate(today);

        cy.clickSaveAndReturnButton();

        cy.url().should('eq', getApplicationDetailsUrl());
      });
    });
  });
}
