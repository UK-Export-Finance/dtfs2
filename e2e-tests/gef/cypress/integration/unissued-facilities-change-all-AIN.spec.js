import { format } from 'date-fns';

import relative from './relativeURL';

import CONSTANTS from '../fixtures/constants';

import dateConstants from '../fixtures/dateConstants';

import { MOCK_APPLICATION_AIN } from '../fixtures/mocks/mock-deals';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import {
  MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR,
} from '../fixtures/mocks/mock-facilities';
import applicationPreview from './pages/application-preview';
import unissuedFacilityTable from './pages/unissued-facilities';
import aboutFacilityUnissued from './pages/unissued-facilities-about-facility';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationSubmission from './pages/application-submission';
import statusBanner from './pages/application-status-banner';

let dealId;
let token;
let facilityOneId;

const unissuedFacilitiesArray = [
  MOCK_FACILITY_ONE,
  MOCK_FACILITY_THREE,
  MOCK_FACILITY_FOUR,
];

context('Unissued Facilities AIN - change all to issued from unissued table', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      // creates application and inserts facilities and changes status
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        dealId = body._id;
        cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN).then(() => {
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
            facilityOneId = facility.body.details._id;
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
          });
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO));
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE));
          cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR));
          cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
        });
      });
    });
  });

  describe('Change facility to issued from unissued table', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    // ensures the task comment box exists with correct headers and link
    it('task comment box exists with correct header and unissued facilities link', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      applicationPreview.mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
    });

    /* application preview should not have unlocked ability to change unissued facilities until
       at least 1 changed from unissued table
    */
    it('facilities table does not contain any add or change links as have not changed any facilities to issued yet', () => {
      applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_FOUR.name);
      applicationPreview.facilitySummaryListRowAction(0, 0).should('not.exist');

      applicationPreview.facilitySummaryListRowAction(0, 1).should('not.exist');

      applicationPreview.facilitySummaryListRowAction(0, 2).should('not.exist');

      applicationPreview.facilitySummaryListRowKey(0, 3).should('not.have.value', 'Date issued to exporter');

      applicationPreview.facilitySummaryListRowAction(0, 3).should('not.exist');
    });

    it('clicking unissued facilities link takes you to unissued facility list page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.rows().contains(format(dateConstants.threeDaysAgoPlusMonth, 'dd MMM yyyy'));
      statusBanner.applicationBanner().should('exist');
    });

    it('clicking back or update later takes you back to application preview', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));

      applicationPreview.unissuedFacilitiesReviewLink().click();
      // ensures that nothing has changed
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    // clicking update on unissued-facilities table
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

    it('error messages should be correct when entering dates beyond validation limits', () => {
      // when entering no dates
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      aboutFacilityUnissued.continueButton().click();

      aboutFacilityUnissued.issueDateError().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionError().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.coverEndDateError().contains('Enter a cover end date');
      aboutFacilityUnissued.errorSummary().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.errorSummary().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.errorSummary().contains('Enter a cover end date');

      // entering date in the past for issue date
      aboutFacilityUnissued.issueDateDay().type(dateConstants.fourDaysAgoDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.fourDaysAgoMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.fourDaysAgoYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.issueDateError().contains('The issue date must not be before the date of the inclusion notice submission date');
      aboutFacilityUnissued.errorSummary().contains('The issue date must not be before the date of the inclusion notice submission date');

      // entering issue date in the future
      aboutFacilityUnissued.issueDateDay().clear();
      aboutFacilityUnissued.issueDateMonth().clear();
      aboutFacilityUnissued.issueDateYear().clear();
      aboutFacilityUnissued.issueDateDay().type(dateConstants.tomorrowDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.tomorrowMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.tomorrowYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.issueDateError().contains('The issue date cannot be in the future');
      aboutFacilityUnissued.errorSummary().contains('The issue date cannot be in the future');

      aboutFacilityUnissued.issueDateDay().clear();
      aboutFacilityUnissued.issueDateMonth().clear();
      aboutFacilityUnissued.issueDateYear().clear();
      aboutFacilityUnissued.issueDateDay().type(dateConstants.todayDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.todayMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.todayYear);

      // entering cover start date before issue date
      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.threeDaysDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.threeDaysMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.threeDaysYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.coverStartDateError().contains('Cover start date cannot be before the issue date');
      aboutFacilityUnissued.errorSummary().contains('Cover start date cannot be before the issue date');

      // entering cover start date beyond 3 months from notice date
      aboutFacilityUnissued.coverStartDateDay().clear();
      aboutFacilityUnissued.coverStartDateMonth().clear();
      aboutFacilityUnissued.coverStartDateYear().clear();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.threeMonthsOneDayDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.threeMonthsOneDayMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      // coverEnd date before coverStartDate
      aboutFacilityUnissued.coverStartDateDay().clear();
      aboutFacilityUnissued.coverStartDateMonth().clear();
      aboutFacilityUnissued.coverStartDateYear().clear();
      aboutFacilityUnissued.coverStartDateDay().type(dateConstants.twoMonthsDay);
      aboutFacilityUnissued.coverStartDateMonth().type(dateConstants.twoMonthsMonth);
      aboutFacilityUnissued.coverStartDateYear().type(dateConstants.twoMonthsYear);
      aboutFacilityUnissued.coverEndDateDay().type(dateConstants.twentyEightDay);
      aboutFacilityUnissued.coverEndDateMonth().type(dateConstants.twentyEightMonth);
      aboutFacilityUnissued.coverEndDateYear().type(dateConstants.twentyEightYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.errorSummary().contains('Cover end date cannot be before cover start date');
    });

    it('the correct success messages should be displayed after changing facility to issued', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
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
      aboutFacilityUnissued.continueButton().click();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[0].name} is updated`);
      // checks the facility has been removed from unissued list
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      // should not be able to continue until all facilities issued - instead use update later to go to preview
      unissuedFacilityTable.continueButton().should('not.exist');

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

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[1].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 2);
      unissuedFacilityTable.continueButton().should('not.exist');

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

      unissuedFacilityTable.rows().should('have.length', 0);
      unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility stages are now updated');
      unissuedFacilityTable.continueButton().should('exist');
      // exists since all unissued updated from table
      unissuedFacilityTable.continueButton().click();
    });

    // task comments box should show facilities names have changed to unissued
    it('preview review facility stage has correct headers and shows all 3 updated facilities and submit button should be visible', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    /* should be able to change dates on facility that has changed to issued */
    it('facility table should have change links on the changed to issued facilities', () => {
      // to check date format
      const issuedDate = format(dateConstants.today, 'd MMMM yyyy');
      const coverStart = format(dateConstants.twoMonths, 'd MMMM yyyy');
      const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');

      // should be able to change facility four as changed to issued
      applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_FOUR.name);
      applicationPreview.facilitySummaryListRowAction(0, 0).contains('Change');
      applicationPreview.facilitySummaryListRowAction(0, 1).should('have.value', '');
      applicationPreview.facilitySummaryListRowValue(0, 2).contains('Issued');
      applicationPreview.facilitySummaryListRowAction(0, 2).should('have.value', '');
      applicationPreview.facilitySummaryListRowValue(0, 3).contains(issuedDate);
      applicationPreview.facilitySummaryListRowAction(0, 3).contains('Change');
      applicationPreview.facilitySummaryListRowValue(0, 4).contains(coverStart);
      applicationPreview.facilitySummaryListRowAction(0, 4).contains('Change');
      applicationPreview.facilitySummaryListRowValue(0, 5).contains(coverEnd);
      applicationPreview.facilitySummaryListRowAction(0, 5).contains('Change');

      // should not be able to change facility two has previously issued (not changed from unissued to issued)
      applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_TWO.name);
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowValue(2, 2).contains('Issued');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowKey(2, 3).should('not.have.value', 'Date issued to exporter');
      applicationPreview.facilitySummaryListRowValue(2, 3).contains('Date you submit the notice');
      applicationPreview.facilitySummaryListRowAction(2, 3).should('not.exist');
    });

    // checks that can edit changed facility
    it('clicking change should take you to about facility page with different url', () => {
      const issuedDate = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
      const coverStart = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');

      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListRowValue(3, 0).contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListRowValue(3, 3).contains(issuedDate);
      applicationPreview.facilitySummaryListRowAction(3, 0).contains('Change');
      applicationPreview.facilitySummaryListRowValue(3, 4).contains(coverStart);
      applicationPreview.facilitySummaryListRowAction(3, 0).click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));

      // checks that cancel does not save changes
      aboutFacilityUnissued.facilityName().clear();
      aboutFacilityUnissued.facilityName().type(`${MOCK_FACILITY_ONE.name}name`);
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      aboutFacilityUnissued.cancelLink().click();

      applicationPreview.facilitySummaryListRowValue(3, 0).contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListRowAction(3, 0).contains('Change');
      applicationPreview.facilitySummaryListRowAction(3, 0).click();

      aboutFacilityUnissued.facilityName().clear();
      aboutFacilityUnissued.facilityName().type(`${MOCK_FACILITY_ONE.name}name`);
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      aboutFacilityUnissued.continueButton().click();

      // checks that name has been updated
      applicationPreview.facilitySummaryListRowValue(3, 0).contains(`${MOCK_FACILITY_ONE.name}name`);
      applicationPreview.facilitySummaryListRowValue(3, 3).contains(issuedDate);
    });

    // checks that can submit application to checker with changed facilities
    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains('Someone at your bank must check your update before they can submit it to UKEF');
      applicationSubmission.submitButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted for checking at your bank');
    });
  });
});
