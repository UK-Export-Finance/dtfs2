import relative from './relativeURL';

import CONSTANTS from '../fixtures/constants';

import dateConstants from '../../../e2e-fixtures/dateConstants';

import { MOCK_APPLICATION_MIN } from '../fixtures/mocks/mock-deals';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import {
  MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR,
} from '../fixtures/mocks/mock-facilities';

import applicationPreview from './pages/application-preview';
import unissuedFacilityTable from './pages/unissued-facilities';
import aboutFacilityUnissued from './pages/unissued-facilities-about-facility';
import CREDENTIALS from '../fixtures/credentials.json';
import statusBanner from './pages/application-status-banner';

let dealId;
let token;
let facilityOneId;

const FACILITY_THREE_SPECIAL = { ...MOCK_FACILITY_THREE };
FACILITY_THREE_SPECIAL.specialIssuePermission = true;

context('Unissued Facilities MIN - change to issued more than 3 months after MIN submission date', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        dealId = body._id;
        MOCK_APPLICATION_MIN.manualInclusionNoticeSubmissionDate = `${dateConstants.oneYearUnix}608`;
        cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIN).then(() => {
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
            facilityOneId = facility.body.details._id;
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
          });
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO));
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, FACILITY_THREE_SPECIAL));
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR));
          cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
        });
      });
    });
  });

  describe('Change facility to issued from application preview', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('clicking unissued facilities link takes you to unissued facility list page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
      statusBanner.applicationBanner().should('exist');
      unissuedFacilityTable.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('clicking on update should take you to the update facility page with correct url', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
    });

    it('update facility page should have correct titles and text (only name should be prepopulated', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.mainHeading().contains('Tell us you\'ve issued this facility');
      aboutFacilityUnissued.facilityNameLabel().contains('Name for this cash facility');
      aboutFacilityUnissued.facilityName().should('have.value', MOCK_FACILITY_ONE.name);

      aboutFacilityUnissued.issueDateDay().should('have.value', '');
      aboutFacilityUnissued.issueDateMonth().should('have.value', '');
      aboutFacilityUnissued.issueDateMonth().should('have.value', '');
      aboutFacilityUnissued.coverStartDateDay().should('have.value', '');
      aboutFacilityUnissued.coverStartDateMonth().should('have.value', '');
      aboutFacilityUnissued.coverStartDateYear().should('have.value', '');
      aboutFacilityUnissued.coverEndDateDay().should('have.value', '');
      aboutFacilityUnissued.coverEndDateMonth().should('have.value', '');
      aboutFacilityUnissued.coverEndDateYear().should('have.value', '');
    });

    it('should not be able to update facility and then go back to application preview page with coverStartDate more than 3 months in the future', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.issueDateDay().type(dateConstants.todayDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.todayMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.tomorrowDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.tomorrowMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.tomorrowYear);

      aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeYearsDay);
      aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeYearsMonth);
      aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeYearsYear);
      aboutFacilityUnissued.continueButton().click();

      aboutFacilityUnissued.errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      aboutFacilityUnissued.continueButton().click();

      aboutFacilityUnissued.errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
    });

    it('should be able to update facility and then go back to application preview page with coverStartDate more than 3 months in the future if specialIssuePermission', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(1).click();

      aboutFacilityUnissued.issueDateDay().type(dateConstants.todayDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.todayMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.tomorrowDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.tomorrowMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.tomorrowYear);

      aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeYearsDay);
      aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeYearsMonth);
      aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeYearsYear);
      aboutFacilityUnissued.continueButton().click();
      // to go back to application preview page
      unissuedFacilityTable.updateFacilitiesLater().click();
    });

    it('should not be able to update facility afrom application preview with coverStartDate more than 3 months in the future if specialIssuePermission', () => {
      // to change to issued from preview page by clicking change on issued row
      applicationPreview.facilitySummaryListRowAction(0, 2).click();
      aboutFacilityUnissued.facilityName().clear();
      aboutFacilityUnissued.facilityName().type(`${MOCK_FACILITY_FOUR.name}name`);

      aboutFacilityUnissued.issueDateDay().type(dateConstants.todayDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.todayMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.tomorrowDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.tomorrowMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.tomorrowYear);

      aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeYearsDay);
      aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeYearsMonth);
      aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeYearsYear);
      aboutFacilityUnissued.continueButton().click();

      aboutFacilityUnissued.errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      aboutFacilityUnissued.continueButton().click();

      aboutFacilityUnissued.errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
    });
  });
});
