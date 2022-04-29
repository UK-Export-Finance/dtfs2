import { format } from 'date-fns';

import relative from './relativeURL';

import CONSTANTS from '../fixtures/constants';

import { MOCK_APPLICATION_AIN } from '../fixtures/mocks/mock-deals';
import { MOCK_USER_MAKER } from '../fixtures/mocks/mock-user-maker';
import dateConstants from '../../../e2e-fixtures/dateConstants';

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

/*
  for changing facilities to issued from preview page.
  To unlock functionality, need to first issue one facility from unissued-facility table
*/
context('Unissued Facilities AIN - change to issued from preview page', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
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

    it('should be able to update facility and then go back to application preview page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.issueDateDay().type(dateConstants.threeDaysDay);
      aboutFacilityUnissued.issueDateMonth().type(dateConstants.threeDaysMonth);
      aboutFacilityUnissued.issueDateYear().type(dateConstants.threeDaysYear);

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

    it('preview review facility stage has correct headers and shows 1 updated facilities', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');

      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      // should not be able to go back to unissued-facilities table once updated at least one facility
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      // should be able to submit to checker since facility issued
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    it('facility table should have change links on the changed to issued facilities', () => {
      const issuedDate = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
      const coverStart = format(dateConstants.twoMonths, 'd MMMM yyyy');
      const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');

      // can change facility one name and issue dates etc since changed to issued
      applicationPreview.facilitySummaryListRowValue(3, 0).contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListRowAction(3, 0).contains('Change');
      applicationPreview.facilitySummaryListRowAction(3, 1).should('have.value', '');
      applicationPreview.facilitySummaryListRowAction(3, 2).contains('Change');
      applicationPreview.facilitySummaryListRowValue(3, 3).contains(issuedDate);
      applicationPreview.facilitySummaryListRowAction(3, 3).contains('Change');
      applicationPreview.facilitySummaryListRowValue(3, 4).contains(coverStart);
      applicationPreview.facilitySummaryListRowAction(3, 4).contains('Change');
      applicationPreview.facilitySummaryListRowValue(3, 5).contains(coverEnd);
      applicationPreview.facilitySummaryListRowAction(3, 5).contains('Change');
      applicationPreview.facilitySummaryListRowAction(3, 7).should('have.value', '');
      applicationPreview.facilitySummaryListRowAction(3, 8).should('have.value', '');
      applicationPreview.facilitySummaryListRowAction(3, 9).should('have.value', '');
      applicationPreview.facilitySummaryListRowAction(3, 10).should('have.value', '');
      applicationPreview.facilitySummaryListRowAction(3, 11).should('have.value', '');

      // not be able to change facility four name, but can change to issued
      applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_FOUR.name);
      applicationPreview.facilitySummaryListRowAction(0, 0).should('have.value', '');

      applicationPreview.facilitySummaryListRowAction(0, 1).should('have.value', '');
      applicationPreview.facilitySummaryListRowValue(0, 2).contains('Unissued');
      applicationPreview.facilitySummaryListRowAction(0, 2).contains('Change');

      applicationPreview.facilitySummaryListRowKey(0, 2).should('not.have.value', 'Date issued to exporter');
      applicationPreview.facilitySummaryListRowKey(0, 3).should('not.have.value', 'Cover start date');
      applicationPreview.facilitySummaryListRowKey(0, 4).should('not.have.value', 'Cover end date');

      // should not be able to change facility two has previously issued
      applicationPreview.facilitySummaryListRowValue(2, 0).contains(MOCK_FACILITY_TWO.name);
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');

      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowValue(2, 2).contains('Issued');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');

      applicationPreview.facilitySummaryListRowKey(2, 3).should('not.have.value', 'Date issued to exporter');
      applicationPreview.facilitySummaryListRowValue(2, 3).contains('Date you submit the notice');
      applicationPreview.facilitySummaryListRowAction(2, 3).should('not.exist');
    });

    it('change unissued to issued from application preview page', () => {
      // to change to issued from preview page by clicking change on issued row
      applicationPreview.facilitySummaryListRowAction(0, 2).click();
      aboutFacilityUnissued.facilityName().clear();
      aboutFacilityUnissued.facilityName().type(`${MOCK_FACILITY_FOUR.name}name`);

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
    });

    it('change links should appear for facility four and three should be unissued still', () => {
      const issuedDate = format(dateConstants.today, 'd MMMM yyyy');
      const coverStart = format(dateConstants.twoMonths, 'd MMMM yyyy');
      const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');

      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      // should show new facility four name
      applicationPreview.updatedUnissuedFacilitiesList().contains(`${unissuedFacilitiesArray[2].name}name`);

      // check correct change links are shown for rows of issued facility
      applicationPreview.facilitySummaryListRowValue(0, 0).contains(`${unissuedFacilitiesArray[2].name}name`);
      applicationPreview.facilitySummaryListRowAction(0, 0).contains('Change');
      applicationPreview.facilitySummaryListRowAction(0, 1).should('have.value', '');
      applicationPreview.facilitySummaryListRowValue(0, 2).contains('Issued');
      applicationPreview.facilitySummaryListRowAction(0, 2).contains('Change');
      applicationPreview.facilitySummaryListRowValue(0, 3).contains(issuedDate);
      applicationPreview.facilitySummaryListRowAction(0, 3).contains('Change');
      applicationPreview.facilitySummaryListRowValue(0, 4).contains(coverStart);
      applicationPreview.facilitySummaryListRowAction(0, 4).contains('Change');
      applicationPreview.facilitySummaryListRowValue(0, 5).contains(coverEnd);
      applicationPreview.facilitySummaryListRowAction(0, 5).contains('Change');

      // facility three still unissued
      applicationPreview.facilitySummaryListRowValue(1, 0).contains(MOCK_FACILITY_THREE.name);
      applicationPreview.facilitySummaryListRowAction(1, 0).should('have.value', '');
      applicationPreview.facilitySummaryListRowAction(1, 1).should('have.value', '');
      applicationPreview.facilitySummaryListRowValue(1, 2).contains('Unissued');
      applicationPreview.facilitySummaryListRowAction(1, 2).contains('Change');
      applicationPreview.facilitySummaryListRowKey(1, 2).should('not.have.value', 'Date issued to exporter');
      applicationPreview.facilitySummaryListRowKey(1, 3).should('not.have.value', 'Cover start date');
      applicationPreview.facilitySummaryListRowKey(1, 4).should('not.have.value', 'Cover end date');
    });

    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      // ensures that can submit even with 1 unissued left still
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains('Someone at your bank must check your update before they can submit it to UKEF');
      applicationSubmission.submitButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted for checking at your bank');
    });
  });
});
