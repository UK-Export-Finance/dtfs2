import relative from '../../relativeURL';
import CONSTANTS from '../../../fixtures/constants';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
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
      beforeEach(() => {
        cy.visit(relative(`/gef/application-details/${dealId}/unissued-facilities`));
        unissuedFacilityTable.updateIndividualFacilityButton(0).click();

        aboutFacilityUnissued.issueDateDay().type(dateConstants.threeDaysDay);
        aboutFacilityUnissued.issueDateMonth().type(dateConstants.threeDaysMonth);
        aboutFacilityUnissued.issueDateYear().type(dateConstants.threeDaysYear);

        aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
        aboutFacilityUnissued.coverStartDateDay().type(dateConstants.threeDaysDay);
        aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.threeDaysMonth);
        aboutFacilityUnissued.coverStartDateYear().type(dateConstants.threeDaysYear);

        aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeMonthsOneDayDay);
        aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeMonthsOneDayMonth);
        aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeMonthsOneDayYear);

        aboutFacilityUnissued.isUsingFacilityEndDateNo().click();

        aboutFacilityUnissued.continueButton().click();
      });

      it('should redirect user to the about unissued facility page when clicking back link', () => {
        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/bank-review-date`));

        bankReviewDate.backLink().click();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
      });

      it('should display error messages', () => {
        bankReviewDate.bankReviewDateDay().clear().type('abcd');
        bankReviewDate.continueButton().click();

        bankReviewDate.errorSummary();
        bankReviewDate.bankReviewDateError();
      });

      it('should redirect user to the unissued facility page when clicking continue', () => {
        bankReviewDate.bankReviewDateDay().clear().type(dateConstants.todayDay);
        bankReviewDate.bankReviewDateMonth().clear().type(dateConstants.todayMonth);
        bankReviewDate.bankReviewDateYear().clear().type(dateConstants.todayYear);

        bankReviewDate.continueButton().click();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      });

      it('should redirect user to the unissued facility page when clicking save and return', () => {
        bankReviewDate.bankReviewDateDay().clear().type(dateConstants.todayDay);
        bankReviewDate.bankReviewDateMonth().clear().type(dateConstants.todayMonth);
        bankReviewDate.bankReviewDateYear().clear().type(dateConstants.todayYear);

        bankReviewDate.saveAndReturnButton().click();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      });
    });

    describe('Visiting from application preview page', () => {
      beforeEach(() => {
        cy.visit(relative(`/gef/application-details/${dealId}`));
        applicationPreview.facilitySummaryListTable(4).bankReviewDateAction().click();
      });

      it('should redirect user to the about unissued facility page when clicking back link', () => {
        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/bank-review-date/change`));

        bankReviewDate.backLink().click();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));
      });

      it('should display error messages', () => {
        bankReviewDate.bankReviewDateDay().clear().type('abcd');
        bankReviewDate.continueButton().click();

        bankReviewDate.errorSummary();
        bankReviewDate.bankReviewDateError();
      });

      it('should redirect user to the application details page when clicking continue', () => {
        bankReviewDate.bankReviewDateDay().clear().type(dateConstants.todayDay);
        bankReviewDate.bankReviewDateMonth().clear().type(dateConstants.todayMonth);
        bankReviewDate.bankReviewDateYear().clear().type(dateConstants.todayYear);
        bankReviewDate.continueButton().click();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      });

      it('should redirect user to the application details page when clicking save and return', () => {
        bankReviewDate.bankReviewDateDay().clear().type(dateConstants.todayDay);
        bankReviewDate.bankReviewDateMonth().clear().type(dateConstants.todayMonth);
        bankReviewDate.bankReviewDateYear().clear().type(dateConstants.todayYear);

        bankReviewDate.saveAndReturnButton().click();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      });
    });
  });
}
