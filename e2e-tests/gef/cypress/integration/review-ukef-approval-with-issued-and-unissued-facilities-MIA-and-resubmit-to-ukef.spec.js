import relative from './relativeURL';

import CONSTANTS from '../fixtures/constants';

import dateConstants from '../fixtures/dateConstants';

import { MOCK_APPLICATION_MIA, UKEF_DECISION } from '../fixtures/mocks/mock-deals';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import {
  MOCK_FACILITY_ONE, MOCK_FACILITY_TWO_NULL_MIA, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR,
} from '../fixtures/mocks/mock-facilities';
import { toTitleCase } from '../fixtures/helpers';

import applicationPreview from './pages/application-preview';
import unissuedFacilityTable from './pages/unissued-facilities';
import aboutFacilityUnissued from './pages/unissued-facilities-about-facility';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationSubmission from './pages/application-submission';
import statusBanner from './pages/application-status-banner';
import coverStartDate from './pages/cover-start-date';
import applicationDetails from './pages/application-details';
import returnToMaker from './pages/return-to-maker';

let dealId;
let token;
let facilityTwoId;

const unissuedFacilitiesArray = [
  MOCK_FACILITY_ONE,
  MOCK_FACILITY_THREE,
  MOCK_FACILITY_FOUR,
];

const issuedFacilities = [
  MOCK_FACILITY_TWO_NULL_MIA,
];

context('Review UKEF decision MIA -> confirm coverStartDate and issue unissued facility', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      // creates application and inserts facilities and changes status
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        dealId = body._id;
        cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIA).then(() => {
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE));
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
            facilityTwoId = facility.body.details._id;
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO_NULL_MIA);
          });
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE));
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR));
          cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
          cy.addCommentObjToDeal(dealId, CONSTANTS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION, UKEF_DECISION);
        });
      });
    });
  });

  describe('Review UKEF decision', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('relevant fields are locked ', () => {
      //  makes sure no action buttons exist (change or add)
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 8).should('not.exist');

      applicationPreview.facilitySummaryListRowAction(0, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 8).should('not.exist');

      applicationPreview.facilitySummaryListRowAction(1, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 8).should('not.exist');

      applicationPreview.facilitySummaryListRowAction(3, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 7).should('not.exist');
    });

    it('checks correct status and review UKEF decision link exist', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
      applicationPreview.ukefReview().contains('Review UKEF decision');
      applicationPreview.ukefReviewLink().invoke('attr', 'href').then((href) => {
        expect(href).to.equal(`/gef/application-details/${dealId}/review-decision`);
      });
    });

    it('clicking review UKEF decision displays correct page', () => {
      applicationPreview.ukefReviewLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/review-decision`));
      applicationPreview.ukefReviewHeading().contains('Review UKEF decision');
      applicationPreview.reviewDecision().contains('Do you want to accept these conditions and proceed with UKEF cover?');
    });

    it('clicking yes, accept and proceed takes you to cover-start-date page', () => {
      applicationPreview.ukefReviewLink().click();
      // shows error message do not click yes radio button
      applicationPreview.reviewDecisionContinue().click();
      applicationPreview.errorSummary().contains('Select yes if you want to accept the conditions and proceed with UKEF cover.');
      applicationPreview.reviewDecisionError('Select yes if you want to accept the conditions and proceed with UKEF cover.');

      applicationPreview.reviewDecisionTrue().click();
      applicationPreview.reviewDecisionContinue().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/cover-start-date`));

      coverStartDate.rows().should('have.length', issuedFacilities.length);
      coverStartDate.updateIndividualCoverStartDateButton(0).click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));
      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');
    });

    it('entering cover date in past on confirm cover start date shows an error', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));
      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');

      coverStartDate.coverStartDateNo().click();

      coverStartDate.coverStartDateDay().clear();
      coverStartDate.coverStartDateDay().type(dateConstants.threeDaysDay);
      coverStartDate.coverStartDateMonth().clear();
      coverStartDate.coverStartDateMonth().type(dateConstants.threeDaysMonth);
      coverStartDate.coverStartDateYear().clear();
      coverStartDate.coverStartDateYear().type(dateConstants.threeDaysYear);

      coverStartDate.continueButton().click();

      coverStartDate.errorSummary().contains('Cover date cannot be in the past');
      coverStartDate.coverStartDateNo().click();
      coverStartDate.errorInput().contains('Cover date cannot be in the past');

      coverStartDate.coverStartDateDay().clear();
      coverStartDate.coverStartDateDay().type(dateConstants.threeMonthsOneDayDay);
      coverStartDate.coverStartDateMonth().clear();
      coverStartDate.coverStartDateMonth().type(dateConstants.threeMonthsOneDayMonth);
      coverStartDate.coverStartDateYear().clear();
      coverStartDate.coverStartDateYear().type(dateConstants.threeMonthsOneDayYear);

      coverStartDate.continueButton().click();

      coverStartDate.errorSummary().contains('Cover date must be within 3 months');
      coverStartDate.coverStartDateNo().click();
      coverStartDate.errorInput().contains('Cover date must be within 3 months');
    });

    it('entering cover date correctly shows success message and redirects to unissued facilities table', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));

      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');

      coverStartDate.coverStartDateNo().click();

      coverStartDate.coverStartDateDay().clear();
      coverStartDate.coverStartDateDay().type(dateConstants.tomorrowDay);
      coverStartDate.coverStartDateMonth().clear();
      coverStartDate.coverStartDateMonth().type(dateConstants.tomorrowMonth);
      coverStartDate.coverStartDateYear().clear();
      coverStartDate.coverStartDateYear().type(dateConstants.tomorrowYear);

      coverStartDate.continueButton().click();

      coverStartDate.coverStartDateSuccess().contains('All cover start dates confirmed for issued facilities');
      coverStartDate.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.updateFacilitiesLater().click();

      // link on application preview exists
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
    });

    it('can update one unissued facility and return to application preview', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.issueDateDay().type(dateConstants.todayDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.todayMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.todayYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.twoMonthsDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.twoMonthsMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.twoMonthsYear);

      aboutFacilityUnissued.coverEndDateDay().type(dateConstants.threeMonthsOneDayDay);
      aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.threeMonthsOneDayMonth);
      aboutFacilityUnissued.coverEndDateYear().type(dateConstants.threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[0].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      unissuedFacilityTable.continueButton().should('not.exist');
      // to go back to application preview page
      unissuedFacilityTable.updateFacilitiesLater().click();
    });

    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains(`Someone at your bank must check your ${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)} before they can submit it to UKEF.`);
      applicationSubmission.submitButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)} submitted for checking at your bank`);
    });
  });
});

context('Return to maker', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show changed facilities in task comments box with correct heading for reviewing UKEF decision', () => {
      applicationPreview.miaStageChecker().contains('Check manual inclusion application before submitting to UKEF');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL);
    });

    it('should not be able to edit any facilities', () => {
      // 1st facility table - makes sure no action buttons exist (change or add)
      applicationPreview.facilitySummaryListRowAction(0, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 8).should('not.exist');

      // second facility
      applicationPreview.facilitySummaryListRowAction(1, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 8).should('not.exist');

      // third facility
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 8).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 9).should('not.exist');

      // forth facility
      applicationPreview.facilitySummaryListRowAction(3, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 8).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 9).should('not.exist');
    });

    it('submit to ukef and return to maker buttons exist and able to return to maker', () => {
      applicationPreview.submitButton().should('exist');
      applicationPreview.returnButton().should('exist');
      applicationPreview.returnButton().click();
      returnToMaker.submitButton().click();
      cy.location('pathname').should('contain', 'dashboard');
    });
  });

  /**
   * log in as maker as application is on Further Maker's input required
   * ensure application details page is locked apart from unissued facilities section
   * submit to checker
  */
  describe('Check application details page works as expected with correct fields unlocked', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Statuses and banners should correct text', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED);
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
    });

    it('should not have all fields unlocked', () => {
      // should not be able to add or delete facilities
      applicationDetails.addCashFacilityButton().should('not.exist');
      applicationDetails.addContingentFacilityButton().should('not.exist');
      applicationDetails.deleteFacilityLink().should('not.exist');

      // facility which confirmed cover
      applicationDetails.facilitySummaryListRowAction(2, 0).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 2).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 3).contains('Change');
      applicationDetails.facilitySummaryListRowAction(2, 4).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 5).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 7).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 8).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(2, 9).should('have.value', '');

      // 1st facility table - make sure change exists on issue action
      applicationDetails.facilitySummaryListRowAction(0, 0).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 2).contains('Change');
      applicationDetails.facilitySummaryListRowAction(0, 3).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 4).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 5).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 7).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 8).should('have.value', '');

      // second facility - make sure change exists on issue action
      applicationDetails.facilitySummaryListRowAction(1, 0).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 2).contains('Change');
      applicationDetails.facilitySummaryListRowAction(1, 3).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 4).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 5).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 7).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 8).should('have.value', '');

      // forth facility has change links as changedToIssued
      applicationDetails.facilitySummaryListRowAction(3, 0).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 2).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 3).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 4).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 5).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 7).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 8).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 9).should('have.value', '');

      // should not be able to edit exporter table
      applicationDetails.exporterSummaryListRowAction(0, 0).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 1).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 2).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 3).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 4).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 5).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 6).should('have.value', '');
      applicationDetails.exporterSummaryListRowAction(0, 7).should('have.value', '');

      // should not be able to edit eligibility criteria
      applicationDetails.automaticCoverSummaryListRowAction(0, 0).should('not.exist');

      // abandon link should not exist
      applicationDetails.abandonLink().should('not.exist');
      // should not be able to edit ref name
      applicationDetails.editRefNameLink().should('not.exist');
      // should not be able to edit supporting info
      applicationDetails.supportingInfoListRowAction(0, 0).should('not.exist');
      applicationDetails.supportingInfoListRowAction(0, 1).should('not.exist');
    });

    it('should be able to submit to checker after making changes', () => {
      applicationDetails.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)} submitted for checking at your bank`);
    });
  });
});

/**
 * log in as checker
 * ensure everything locked
 * submit to UKEF
 * ensure correct success message and text are shown
*/
context('Submit to UKEF', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show changed facilities in task comments box with correct heading including newly issued', () => {
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL);
    });

    it('submit to ukef and return to maker buttons exist and able to return to maker', () => {
      applicationPreview.submitButton().should('exist');
      applicationPreview.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIN)} submitted to UKEF`);
      // check that correct text is displayed under confirmation panel
      applicationSubmission.confirmationText().contains('We\'ll send you a confirmation email shortly, once we\'ve acknowledged your inclusion notice.');
    });
  });
});
