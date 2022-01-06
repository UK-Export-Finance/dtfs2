import relative from './relativeURL';

const CONSTANTS = require('../fixtures/constants');

const { add, format } = require('date-fns');

import {
  MOCK_APPLICATION_MIN, MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR, MOCK_USER_MAKER,
} from '../fixtures/MOCKS/MOCK_DEALS';
import applicationPreview from './pages/application-preview';
import unissuedFacilityTable from './pages/unissued-facilities';
import aboutFacilityUnissued from './pages/unissued-facilities-about-facility';
import CREDENTIALS from '../fixtures/credentials.json';
import applicationSubmission from './pages/application-submission';
import statusBanner from './pages/application-status-banner';
import returnToMaker from './pages/return-to-maker';
import applicationDetails from './pages/application-details';

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
// to test that if beyond issue/ coverstartdate limit
const threeMonthsOneDay = add(today, { months: 3, days: 1 });
const threeMonthsOneDayDay = format(threeMonthsOneDay, 'dd');
const threeMonthsOneDayMonth = format(threeMonthsOneDay, 'M');
const threeMonthsOneDayYear = format(threeMonthsOneDay, 'yyyy');

context('Unissued Facilities AIN - change all to issued from unissued table', () => {
  before(() => {
    cy.apiLogin(CREDENTIALS.MAKER).then((t) => {
      token = t;
    }).then(() => {
      // creates application and inserts facilities and changes status
      cy.apiCreateApplication(MOCK_USER_MAKER, token).then(({ body }) => {
        dealId = body._id;
        cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIN).then(() => {
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

    it('updates 2 facilities from unissued facility table', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(1).click();

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
      // checks the facility has been removed from unissued list
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      // should not be able to continue until all facilities issued - instead use update later to go to preview
      unissuedFacilityTable.continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(1).click();
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

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[2].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 2);
      unissuedFacilityTable.continueButton().should('not.exist');

      unissuedFacilityTable.updateFacilitiesLater().click();
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

/**
 * Logged in as checker
 * checking all fields are blocked for facilities
 * return to maker
*/
context('Return to maker for unissued to issued facilities', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show changed facilities in task comments box with correct heading', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains('Ready for Checker\'s approval');
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
      applicationPreview.facilitySummaryListRowAction(0, 9).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 10).should('not.exist');

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
      applicationPreview.facilitySummaryListRowAction(1, 9).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 10).should('not.exist');

      // third facility
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 8).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 9).should('not.exist');

      // forth facility table - shorter as not yet issued
      applicationPreview.facilitySummaryListRowAction(3, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 7).should('not.exist');
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
   * ensure application details page is locked apart from unissued facilites section
   * change 1 facility to issued and ensure added to changed list
   * submit to checker
  */
  describe('Check application details page works as expected with correct fields unlocked', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.MAKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Statuses and banners should correct text', () => {
      statusBanner.bannerStatus().contains('Further Maker\'s input required');
      applicationPreview.reviewFacilityStage().contains('Change facility details');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
    });

    it('should not have all fields unlocked', () => {
      // should not be able to add or delete facilities
      applicationDetails.addCashFacilityButton().should('not.exist');
      applicationDetails.addContingentFacilityButton().should('not.exist');
      applicationDetails.deleteFacilityLink().should('not.exist');

      // the already issued so cannot change anything
      applicationDetails.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 3).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 4).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 5).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 6).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 7).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 8).should('not.exist');
      applicationDetails.facilitySummaryListRowAction(2, 9).should('not.exist');

      // 1st facility table - makes sure no action buttons exist (change or add)
      applicationDetails.facilitySummaryListRowAction(0, 0).contains('Change');
      applicationDetails.facilitySummaryListRowAction(0, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 2).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 3).contains('Change');
      applicationDetails.facilitySummaryListRowAction(0, 4).contains('Change');
      applicationDetails.facilitySummaryListRowAction(0, 5).contains('Change');
      applicationDetails.facilitySummaryListRowAction(0, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 7).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 8).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 9).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(0, 10).should('have.value', '');

      // second facility
      applicationDetails.facilitySummaryListRowAction(1, 0).contains('Change');
      applicationDetails.facilitySummaryListRowAction(1, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 2).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 3).contains('Change');
      applicationDetails.facilitySummaryListRowAction(1, 4).contains('Change');
      applicationDetails.facilitySummaryListRowAction(1, 5).contains('Change');
      applicationDetails.facilitySummaryListRowAction(1, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 7).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 8).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 9).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(1, 10).should('have.value', '');

      // forth facility table only has change as not yet issued
      applicationDetails.facilitySummaryListRowAction(3, 0).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 1).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 2).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 3).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 4).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 5).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 7).should('have.value', '');

      // should not be able to edit exporter table
      applicationDetails.exporterSummaryListRowAction(0, 0).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 1).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 2).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 3).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 4).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 5).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 6).should('not.exist');
      applicationDetails.exporterSummaryListRowAction(0, 7).should('not.exist');

      // should not be able to edit eligibility criteria
      applicationDetails.automaticCoverSummaryListRowAction(0, 0).should('not.exist');

      // abandon link should not exist
      applicationDetails.abandonLink().should('not.exist');
      // should not be able to edit ref name
      applicationDetails.editRefNameLink().should('not.exist');
    });

    // change facility to issued and check correct format
    it('change unissued to issued from application details whilst changes required', () => {
      const issuedDate = format(oneMonth, 'd MMMM yyyy');
      const coverStart = format(twoMonths, 'd MMMM yyyy');
      const coverEnd = format(threeMonthsOneDay, 'd MMMM yyyy');

      applicationDetails.facilitySummaryListRowAction(3, 1).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));

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

      // forth facility table has correct name and dates
      applicationDetails.facilitySummaryListRowValue(3, 0).contains(MOCK_FACILITY_ONE.name);
      applicationDetails.facilitySummaryListRowAction(3, 0).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 1).should('have.value', '');
      applicationDetails.facilitySummaryListRowValue(3, 2).contains(issuedDate);
      applicationDetails.facilitySummaryListRowAction(3, 2).contains('Change');
      applicationDetails.facilitySummaryListRowValue(3, 3).contains(coverStart);
      applicationDetails.facilitySummaryListRowAction(3, 3).contains('Change');
      applicationDetails.facilitySummaryListRowValue(3, 4).contains(coverEnd);
      applicationDetails.facilitySummaryListRowAction(3, 4).contains('Change');
      applicationDetails.facilitySummaryListRowAction(3, 5).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 6).should('have.value', '');
      applicationDetails.facilitySummaryListRowAction(3, 7).should('have.value', '');

      // check that header updated to include this facility
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
    });

    it('should be able to submit to checker after making changes', () => {
      applicationDetails.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted for checking at your bank');
    });
  });
});

/**
 * log in as checker
 * ensure everything locked
 * submit to UKEF
 * ensure correct success message and text are shown
*/
context('Submit to UKEF with unissued to issued facilities', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      Cypress.Cookies.preserveOnce('connect.sid');
      cy.login(CREDENTIALS.CHECKER);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show changed facilities in task comments box with correct heading including newly issued', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains('Ready for Checker\'s approval');
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
      applicationPreview.facilitySummaryListRowAction(0, 9).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(0, 10).should('not.exist');

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
      applicationPreview.facilitySummaryListRowAction(1, 9).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(1, 10).should('not.exist');

      // third facility
      applicationPreview.facilitySummaryListRowAction(2, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 8).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(2, 9).should('not.exist');

      // forth facility table
      applicationPreview.facilitySummaryListRowAction(3, 0).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 1).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 2).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 3).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 4).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 5).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 6).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 7).should('not.exist');
      applicationPreview.facilitySummaryListRowAction(3, 8).should('not.exist');
    });

    it('submit to ukef and return to maker buttons exist and able to return to maker', () => {
      applicationPreview.submitButton().should('exist');
      applicationPreview.submitButton().click();
      applicationSubmission.submitButton().click();
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted to UKEF');
      // check that correct text is displayed under confirmation panel
      applicationSubmission.confirmationText().contains('We’ll send you a confirmation email shortly, once we’ve acknowledged your issued facilities.');
    });
  });
});
