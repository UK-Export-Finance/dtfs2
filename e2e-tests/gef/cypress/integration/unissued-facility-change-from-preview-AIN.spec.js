import relative from './relativeURL';

const CONSTANTS = require('../fixtures/constants');

const { add, format } = require('date-fns');

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

context('Unissued Facilities AIN - change to issued from preview page', () => {
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

    it('update facilities later link should take you back to application preview', () => {
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
      unissuedFacilityTable.updateFacilitiesLater().click();
    });

    it('preview review facility stage has correct headers and shows 1 updated facilities', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');

      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    it('facility table should have change links on the changed to issued facilities', () => {
      // not be able to change 1 name, but can change to issued
      applicationPreview.facilitySummaryListRowValue(0, 0).contains(MOCK_FACILITY_FOUR.name);
      applicationPreview.facilitySummaryListRowAction(0, 0).should('have.value', '');

      applicationPreview.facilitySummaryListRowAction(0, 1).should('have.value', '');
      applicationPreview.facilitySummaryListRowValue(0, 2).contains('Unissued');
      applicationPreview.facilitySummaryListRowAction(0, 2).contains('Change');

      applicationPreview.facilitySummaryListRowKey(0, 2).should('not.have.value', 'Date issued to exporter');
      applicationPreview.facilitySummaryListRowKey(0, 3).should('not.have.value', 'Cover start date');
      applicationPreview.facilitySummaryListRowKey(0, 4).should('not.have.value', 'Cover end date');

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

    it('change unissued to issued from application preview page', () => {
      applicationPreview.facilitySummaryListRowAction(0, 2).click();
      aboutFacilityUnissued.facilityName().clear();
      aboutFacilityUnissued.facilityName().type(`${MOCK_FACILITY_FOUR.name}name`);

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
    });

    it('review facility stage should show updated facility on list', () => {
      const issuedDate = format(oneMonth, 'd MMMM yyyy');
      const coverStart = format(twoMonths, 'd MMMM yyyy');
      const coverEnd = format(threeMonthsOneDay, 'd MMMM yyyy');

      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(`${unissuedFacilitiesArray[2].name}name`);

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
    });

    it('change links should appear for facility four and three should be unissued still', () => {
      const issuedDate = format(oneMonth, 'd MMMM yyyy');
      const coverStart = format(twoMonths, 'd MMMM yyyy');
      const coverEnd = format(threeMonthsOneDay, 'd MMMM yyyy');

      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(`${unissuedFacilitiesArray[2].name}name`);

      applicationPreview.facilitySummaryListRowValue(0, 0).contains(`${unissuedFacilitiesArray[2].name}name`);
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
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains('Someone at your bank must check your update before they can submit it to UKEF');
      applicationSubmission.submitButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted for checking at your bank');
    });
  });
});
