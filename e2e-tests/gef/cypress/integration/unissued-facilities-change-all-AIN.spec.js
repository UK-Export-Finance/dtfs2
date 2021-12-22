import relative from './relativeURL';

const CONSTANTS = require('../fixtures/constants');

const { sub, add, format } = require('date-fns');

import {
  MOCK_AIN_APPLICATION, MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR, MOCK_USER_MAKER,
} from '../fixtures/MOCKS/MOCK_DEALS';
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

const today = new Date();
const fourDaysAgo = sub(today, { days: 4 });
const fourDaysAgoDay = format(fourDaysAgo, 'dd');
const fourDaysAgoMonth = format(fourDaysAgo, 'M');
const fourDaysAgoYear = format(fourDaysAgo, 'yyyy');
const oneMonth = add(today, { months: 1 });
const oneMonthDay = format(oneMonth, 'dd');
const oneMonthMonth = format(oneMonth, 'M');
const oneMonthYear = format(oneMonth, 'yyyy');
const twoMonths = add(today, { months: 2 });
const twoMonthsDay = format(twoMonths, 'dd');
const twoMonthsMonth = format(twoMonths, 'M');
const twoMonthsYear = format(twoMonths, 'yyyy');
const threeMonthsOneDay = add(today, { months: 3, days: 1 });
const threeMonthsOneDayDay = format(threeMonthsOneDay, 'dd');
const threeMonthsOneDayMonth = format(threeMonthsOneDay, 'M');
const threeMonthsOneDayYear = format(threeMonthsOneDay, 'yyyy');

context('Unissued Facilities AIN - change all to issued from unissued table', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        dealId = body._id;
        cy.apiUpdateApplication(dealId, token, MOCK_AIN_APPLICATION).then(() => {
          cy.apiCreateFacility(dealId, 'CASH', token).then((facility) => {
            facilityOneId = facility.body.details._id;
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
          });
          cy.apiCreateFacility(dealId, 'CASH', token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO));
          cy.apiCreateFacility(dealId, 'CASH', token).then((facility) =>
            cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE));
          cy.apiCreateFacility(dealId, 'CASH', token).then((facility) =>
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

    it('task comment box exists with correct header and unissued facilities link', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
    });

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

      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
      statusBanner.applicationBanner().should('exist');

      unissuedFacilityTable.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('clicking unissued facilities link takes you to unissued facility list page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();

      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');

      unissuedFacilityTable.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    it('clicking on update should take you to the update facility page with correct url', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about-facility`));
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

    it('error messages should be correct', () => {
      const twentyEight = add(today, { days: 28 });
      const twentyEightDay = format(twentyEight, 'dd');
      const twentyEightMonth = format(twentyEight, 'M');
      const twentyEightYear = format(twentyEight, 'yyyy');

      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      aboutFacilityUnissued.continueButton().click();

      aboutFacilityUnissued.issueDateError().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionError().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.coverEndDateError().contains('Enter a cover end date');
      aboutFacilityUnissued.errorSummary().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.errorSummary().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.errorSummary().contains('Enter a cover end date');

      aboutFacilityUnissued.issueDateDay().type(fourDaysAgoDay);
      aboutFacilityUnissued.issueDateMonth().type(fourDaysAgoMonth);
      aboutFacilityUnissued.issueDateYear().type(fourDaysAgoYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.issueDateError().contains('The issue date must not be before the date of the inclusion notice submission date');
      aboutFacilityUnissued.errorSummary().contains('The issue date must not be before the date of the inclusion notice submission date');

      aboutFacilityUnissued.issueDateDay().clear();
      aboutFacilityUnissued.issueDateMonth().clear();
      aboutFacilityUnissued.issueDateYear().clear();
      aboutFacilityUnissued.issueDateDay().type(threeMonthsOneDayDay);
      aboutFacilityUnissued.issueDateMonth().type(threeMonthsOneDayMonth);
      aboutFacilityUnissued.issueDateYear().type(threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.issueDateError().contains('The issue date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.errorSummary().contains('The issue date must be within 3 months of the inclusion notice submission date');

      aboutFacilityUnissued.issueDateDay().clear();
      aboutFacilityUnissued.issueDateMonth().clear();
      aboutFacilityUnissued.issueDateYear().clear();
      aboutFacilityUnissued.issueDateDay().type(oneMonthDay);
      aboutFacilityUnissued.issueDateMonth().type(oneMonthMonth);
      aboutFacilityUnissued.issueDateYear().type(oneMonthYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(twentyEightDay);
      aboutFacilityUnissued.coverStartDateMonth().type(twentyEightMonth);
      aboutFacilityUnissued.coverStartDateYear().type(twentyEightYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.coverStartDateError().contains('Cover start date cannot be before the issue date');
      aboutFacilityUnissued.errorSummary().contains('Cover start date cannot be before the issue date');

      aboutFacilityUnissued.coverStartDateDay().clear();
      aboutFacilityUnissued.coverStartDateMonth().clear();
      aboutFacilityUnissued.coverStartDateYear().clear();
      aboutFacilityUnissued.coverStartDateDay().type(threeMonthsOneDayDay);
      aboutFacilityUnissued.coverStartDateMonth().type(threeMonthsOneDayMonth);
      aboutFacilityUnissued.coverStartDateYear().type(threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      aboutFacilityUnissued.errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      aboutFacilityUnissued.coverStartDateDay().clear();
      aboutFacilityUnissued.coverStartDateMonth().clear();
      aboutFacilityUnissued.coverStartDateYear().clear();
      aboutFacilityUnissued.coverStartDateDay().type(twoMonthsDay);
      aboutFacilityUnissued.coverStartDateMonth().type(twoMonthsMonth);
      aboutFacilityUnissued.coverStartDateYear().type(twoMonthsYear);
      aboutFacilityUnissued.coverEndDateDay().type(twentyEightDay);
      aboutFacilityUnissued.coverEndDateMonth().type(twentyEightMonth);
      aboutFacilityUnissued.coverEndDateYear().type(twentyEightYear);
      aboutFacilityUnissued.continueButton().click();
      aboutFacilityUnissued.coverEndDateError().contains('Cover end date cannot be before the issue date');
      aboutFacilityUnissued.errorSummary().contains('Cover end date cannot be before cover start date');
      aboutFacilityUnissued.errorSummary().contains('Cover end date cannot be before the issue date');
    });

    it('the correct success messages should be displayed after changing facility to issued', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.issueDateDay().type(oneMonthDay);
      aboutFacilityUnissued.issueDateMonth().type(oneMonthMonth);
      aboutFacilityUnissued.issueDateYear().type(oneMonthYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(twoMonthsDay);
      aboutFacilityUnissued.coverStartDateMonth().type(twoMonthsMonth);
      aboutFacilityUnissued.coverStartDateYear().type(twoMonthsYear);

      aboutFacilityUnissued.coverEndDateDay().type(threeMonthsOneDayDay);
      aboutFacilityUnissued.coverEndDateMonth().type(threeMonthsOneDayMonth);
      aboutFacilityUnissued.coverEndDateYear().type(threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[0].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      unissuedFacilityTable.continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      aboutFacilityUnissued.issueDateDay().type(oneMonthDay);
      aboutFacilityUnissued.issueDateMonth().type(oneMonthMonth);
      aboutFacilityUnissued.issueDateYear().type(oneMonthYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(twoMonthsDay);
      aboutFacilityUnissued.coverStartDateMonth().type(twoMonthsMonth);
      aboutFacilityUnissued.coverStartDateYear().type(twoMonthsYear);
      aboutFacilityUnissued.coverEndDateDay().type(threeMonthsOneDayDay);
      aboutFacilityUnissued.coverEndDateMonth().type(threeMonthsOneDayMonth);
      aboutFacilityUnissued.coverEndDateYear().type(threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[1].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 2);
      unissuedFacilityTable.continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      aboutFacilityUnissued.issueDateDay().type(oneMonthDay);
      aboutFacilityUnissued.issueDateMonth().type(oneMonthMonth);
      aboutFacilityUnissued.issueDateYear().type(oneMonthYear);

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      aboutFacilityUnissued.coverStartDateDay().type(twoMonthsDay);
      aboutFacilityUnissued.coverStartDateMonth().type(twoMonthsMonth);
      aboutFacilityUnissued.coverStartDateYear().type(twoMonthsYear);

      aboutFacilityUnissued.coverEndDateDay().type(threeMonthsOneDayDay);
      aboutFacilityUnissued.coverEndDateMonth().type(threeMonthsOneDayMonth);
      aboutFacilityUnissued.coverEndDateYear().type(threeMonthsOneDayYear);
      aboutFacilityUnissued.continueButton().click();

      unissuedFacilityTable.rows().should('have.length', 0);
      unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility Stages are now updated');
      unissuedFacilityTable.continueButton().should('exist');
      unissuedFacilityTable.continueButton().click();
    });

    it('preview review facility stage has correct headers and shows all 3 updated facilities', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
    });

    it('preview review facility stage has correct headers and shows all 3 updated facilities and submit button should be visible', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    it('facility table should have change links on the changed to issued facilities', () => {
      const issuedDate = format(oneMonth, 'd MMMM yyyy');
      const coverStart = format(twoMonths, 'd MMMM yyyy');
      const coverEnd = format(threeMonthsOneDay, 'd MMMM yyyy');

      // should be able to change number 1 as changed to issued
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

      // should not be able to change number 3 has previously issued
      applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_TWO.name);
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowValue(2, 2).contains('Issued');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowKey(2, 3).should('not.have.value', 'Date issued to exporter');
      applicationPreview.facilitySummaryListRowValue(2, 3).contains('Date you submit the notice');
      applicationPreview.facilitySummaryListRowAction(2, 3).should('not.exist');
    });

    it('clicking change should take you to about facility page with different url', () => {
      const issuedDate = format(oneMonth, 'd MMMM yyyy');
      const coverStart = format(twoMonths, 'd MMMM yyyy');

      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListRowValue(3, 0).contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListRowAction(3, 0).contains('Change');
      applicationPreview.facilitySummaryListRowValue(3, 3).contains(coverStart);
      applicationPreview.facilitySummaryListRowAction(3, 0).click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities-change/${facilityOneId}/about-facility`));

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

      applicationPreview.facilitySummaryListRowValue(3, 0).contains(`${MOCK_FACILITY_ONE.name}name`);
      applicationPreview.facilitySummaryListRowValue(3, 3).contains(issuedDate);
    });

    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains('Someone at your bank must check your update before they can submit it to UKEF');
      applicationSubmission.submitButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted for checking at your bank');
    });
  });
});
