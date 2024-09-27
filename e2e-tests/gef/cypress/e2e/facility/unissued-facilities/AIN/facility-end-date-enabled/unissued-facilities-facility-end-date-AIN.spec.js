import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import CONSTANTS from '../../../../../fixtures/constants';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import unissuedFacilityTable from '../../../../pages/unissued-facilities';
import applicationPreview from '../../../../pages/application-preview';
import aboutFacilityUnissued from '../../../../pages/unissued-facilities-about-facility';
import facilityEndDate from '../../../../pages/facility-end-date';
import { threeDays, threeMonthsOneDay, today } from '../../../../../../../e2e-fixtures/dateConstants';

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

context('Unissued Facilities AIN - facility end date page - feature flag enabled', () => {
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
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover),
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

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), threeDays.day);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), threeDays.month);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), threeDays.year);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), threeDays.day);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), threeDays.month);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), threeDays.year);

      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), threeMonthsOneDay.day);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), threeMonthsOneDay.month);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), threeMonthsOneDay.year);

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
      cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), today.day);
      cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), today.month);
      cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), today.year);

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
    });

    it('should redirect user to the unissued facility page when clicking save and return', () => {
      cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), today.day);
      cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), today.month);
      cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), today.year);

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
      cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), today.day);
      cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), today.month);
      cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), today.year);
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('should redirect user to the application details page when clicking save and return', () => {
      cy.keyboardInput(facilityEndDate.facilityEndDateDay().clear(), today.day);
      cy.keyboardInput(facilityEndDate.facilityEndDateMonth().clear(), today.month);
      cy.keyboardInput(facilityEndDate.facilityEndDateYear().clear(), today.year);

      cy.clickSaveAndReturnButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('should store values when returning to the page', () => {
      facilityEndDate.facilityEndDateDay().should('have.value', today.day);
      facilityEndDate.facilityEndDateMonth().should('have.value', today.month);
      facilityEndDate.facilityEndDateYear().should('have.value', today.year);

      cy.clickSaveAndReturnButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });
  });
});
