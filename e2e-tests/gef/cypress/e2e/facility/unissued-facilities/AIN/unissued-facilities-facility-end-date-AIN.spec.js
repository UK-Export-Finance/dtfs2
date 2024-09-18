import relative from '../../../relativeURL';
import { errorSummary } from '../../../partials';
import CONSTANTS from '../../../../fixtures/constants';
import dateConstants from '../../../../../../e2e-fixtures/dateConstants';
import { MOCK_APPLICATION_AIN } from '../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import {
  anUnissuedCashFacility,
  anIssuedCashFacility,
  anUnissuedContingentFacility,
  anUnissuedCashFacilityWith20MonthsOfCover,
} from '../../../../fixtures/mocks/mock-facilities';
import unissuedFacilityTable from '../../../pages/unissued-facilities';
import applicationPreview from '../../../pages/application-preview';
import aboutFacilityUnissued from '../../../pages/unissued-facilities-about-facility';
import facilityEndDate from '../../../pages/facility-end-date';

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

const MOCK_FACILITY_ONE = anUnissuedCashFacility({ facilityEndDateEnabled });
const MOCK_FACILITY_TWO = anIssuedCashFacility({ facilityEndDateEnabled });
const MOCK_FACILITY_THREE = anUnissuedContingentFacility({ facilityEndDateEnabled });
const MOCK_FACILITY_FOUR = anUnissuedCashFacilityWith20MonthsOfCover({ facilityEndDateEnabled });

if (facilityEndDateEnabled) {
  context('Unissued Facilities AIN - facility end date page', () => {
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
      beforeEach(() => {
        cy.visit(relative(`/gef/application-details/${dealId}/unissued-facilities`));
        unissuedFacilityTable.updateIndividualFacilityButton(0).click();

        cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.threeDaysDay);
        cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.threeDaysMonth);
        cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.threeDaysYear);

        aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
        cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.threeDaysDay);
        cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.threeDaysMonth);
        cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.threeDaysYear);

        cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.threeMonthsOneDayDay);
        cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.threeMonthsOneDayMonth);
        cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.threeMonthsOneDayYear);

        aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

        cy.clickContinueButton();
      });

      it('should redirect user to the about unissued facility page when clicking back link', () => {
        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/facility-end-date`));

        cy.clickBackLink();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
      });

      it('should display error messages when clicking continue', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), 'abcd');
        cy.clickContinueButton();

        errorSummary();
        facilityEndDate.facilityEndDateError();
      });

      it('should display error messages when clicking save and return', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), 'abcd');
        cy.clickSaveAndReturnButton();

        errorSummary();
        facilityEndDate.facilityEndDateError();
      });

      it('should redirect user to the unissued facility page when clicking continue', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), dateConstants.todayDay);
        cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), dateConstants.todayMonth);
        cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), dateConstants.todayYear);

        cy.clickContinueButton();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      });

      it('should redirect user to the unissued facility page when clicking save and return', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), dateConstants.todayDay);
        cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), dateConstants.todayMonth);
        cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), dateConstants.todayYear);

        cy.clickSaveAndReturnButton();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      });
    });

    describe('Visiting from application preview page', () => {
      beforeEach(() => {
        cy.visit(relative(`/gef/application-details/${dealId}`));
        applicationPreview.facilitySummaryListTable(6).facilityEndDateAction().click();
      });

      it('should redirect user to the about unissued facility page when clicking back link', () => {
        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/facility-end-date/change`));

        cy.clickBackLink();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));
      });

      it('should display error messages when clicking continue', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), 'abcd');
        cy.clickContinueButton();

        errorSummary();
        facilityEndDate.facilityEndDateError();
      });

      it('should display error messages when clicking save and return', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), 'abcd');
        cy.clickSaveAndReturnButton();

        errorSummary();
        facilityEndDate.facilityEndDateError();
      });

      it('should redirect user to the application details page when clicking continue', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), dateConstants.todayDay);
        cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), dateConstants.todayMonth);
        cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), dateConstants.todayYear);
        cy.clickContinueButton();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      });

      it('should redirect user to the application details page when clicking save and return', () => {
        cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), dateConstants.todayDay);
        cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), dateConstants.todayMonth);
        cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), dateConstants.todayYear);

        cy.clickSaveAndReturnButton();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      });

      it('should store values when returning to the page', () => {
        facilityEndDate.facilityEndDateDay().should('have.value', dateConstants.today.getDate());
        facilityEndDate.facilityEndDateMonth().should('have.value', dateConstants.today.getMonth() + 1);
        facilityEndDate.facilityEndDateYear().should('have.value', dateConstants.today.getFullYear());

        cy.clickSaveAndReturnButton();

        cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      });
    });
  });
}
