import { PORTAL_ACTIVITY_LABEL } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import CONSTANTS from '../../../../../fixtures/constants';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { threeDaysAgo, threeMonthsOneDay, twoMonths } from '../../../../../../../e2e-fixtures/dateConstants';
import { multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { continueButton, submitButton } from '../../../../partials';
import applicationPreview from '../../../../pages/application-preview';
import unissuedFacilityTable from '../../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../../pages/unissued-facilities-about-facility';
import applicationSubmission from '../../../../pages/application-submission';
import statusBanner from '../../../../pages/application-status-banner';
import applicationDetails from '../../../../pages/application-details';
import applicationActivities from '../../../../pages/application-activities';

let dealId;
let token;
let facilityOneId;

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

const unissuedFacilitiesArray = [unissuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover];

context('Unissued Facilities AIN - change all to issued from unissued table - feature flag enabled', () => {
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
              unissuedCashFacility._id = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) => {
              unissuedContingentFacility._id = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              unissuedCashFacilityWith20MonthsOfCover._id = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacilityWith20MonthsOfCover);
            });
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
          });
        });
      });
  });

  describe('Change facility to issued from unissued table', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('updates 2 facilities from unissued facility table', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(1).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: threeDaysAgo.date });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonthsOneDay.date });

      cy.clickContinueButton();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[1].name} is updated`);
      // checks the facility has been removed from unissued list
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      // should not be able to continue until all facilities issued - instead use update later to go to preview
      continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(1).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date' });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: twoMonths.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonthsOneDay.date });

      cy.clickContinueButton();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[2].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 2);
      continueButton().should('not.exist');

      unissuedFacilityTable.updateFacilitiesLater().click();
    });

    // checks that can submit application to checker with changed facilities
    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submissionText().contains('Someone at your bank must check your update before they can submit it to UKEF');
      cy.clickSubmitButton();

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
context('Return to maker for unissued to issued facilities - feature flag enabled', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show changed facilities in task comments box with correct heading', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains("Ready for Checker's approval");
    });

    it('should not be able to edit any facilities', () => {
      // 1st facility table - makes sure no action buttons exist (change or add)
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).issueDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // second facility
      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).issueDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(1).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // third facility
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(2).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // forth facility table - shorter as not yet issued
      applicationPreview.facilitySummaryListTable(3).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).dayCountBasisAction().should('have.class', 'govuk-!-display-none');
    });

    it('submit to ukef and return to maker buttons exist and able to return to maker', () => {
      submitButton().should('exist');
      applicationPreview.returnButton().should('exist');
      applicationPreview.returnButton().click();
      cy.clickSubmitButton();
      cy.location('pathname').should('contain', 'dashboard');
    });
  });

  /**
   * log in as maker as application is on Further Maker's input required
   * ensure application details page is locked apart from unissued facilities section
   * change 1 facility to issued and ensure added to changed list
   * submit to checker
   */
  describe('Check application details page works as expected with correct fields unlocked', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Statuses and banners should correct text', () => {
      statusBanner.bannerStatus().contains("Further Maker's input required");
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
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(2).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // 1st facility table - makes sure no action buttons exist (change or add)
      applicationDetails.facilitySummaryListTable(0).nameAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).hasBeenIssuedAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).issueDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).coverStartDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).coverEndDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().contains('Change');

      // second facility
      applicationDetails.facilitySummaryListTable(1).nameAction().contains('Change');
      applicationDetails.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).hasBeenIssuedAction().contains('Change');
      applicationDetails.facilitySummaryListTable(1).issueDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(1).coverStartDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(1).coverEndDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(1).isUsingFacilityEndDateAction().contains('Change');

      // forth facility table only has change as not yet issued
      applicationDetails.facilitySummaryListTable(3).nameAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).hasBeenIssuedAction().contains('Change');
      applicationDetails.facilitySummaryListTable(3).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).valueAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      // should not be able to edit exporter table
      applicationDetails.exporterSummaryListRowAction(0, 0).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 1).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 2).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 3).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 4).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 5).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 6).find('.govuk-link').should('have.class', 'govuk-!-display-none');
      applicationDetails.exporterSummaryListRowAction(0, 7).find('.govuk-link').should('have.class', 'govuk-!-display-none');

      // should not be able to edit eligibility criteria
      applicationDetails.automaticCoverSummaryListRowAction(0, 0).should('not.exist');

      // abandon link should not exist
      applicationDetails.abandonLink().should('not.exist');
      // should not be able to edit ref name
      applicationDetails.editRefNameLink().should('not.exist');
    });

    // change facility to issued and check correct format
    it('change unissued to issued from application details whilst changes required', () => {
      const issuedDate = threeDaysAgo.d_MMMM_yyyy;
      const coverStart = twoMonths.d_MMMM_yyyy;
      const coverEnd = threeMonthsOneDay.d_MMMM_yyyy;
      const facilityEnd = threeMonthsOneDay.d_MMMM_yyyy;

      applicationDetails.facilitySummaryListTable(3).hasBeenIssuedAction().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: threeDaysAgo.date });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: twoMonths.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonthsOneDay.date });

      cy.clickContinueButton();

      // forth facility table has correct name and dates
      applicationDetails.facilitySummaryListTable(3).nameValue().contains(unissuedCashFacility.name);
      applicationDetails.facilitySummaryListTable(3).nameAction().contains('Change');
      applicationDetails.facilitySummaryListTable(3).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).hasBeenIssuedAction().contains('Change');
      applicationDetails.facilitySummaryListTable(3).issueDateValue().contains(issuedDate);
      applicationDetails.facilitySummaryListTable(3).issueDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(3).coverStartDateValue().contains(coverStart);
      applicationDetails.facilitySummaryListTable(3).coverStartDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(3).coverEndDateValue().contains(coverEnd);
      applicationDetails.facilitySummaryListTable(3).coverEndDateAction().contains('Change');
      applicationDetails.facilitySummaryListTable(3).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).valueAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).feeFrequencyAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(3).isUsingFacilityEndDateValue().contains('Yes');
      applicationDetails.facilitySummaryListTable(3).facilityEndDateValue().contains(facilityEnd);
      applicationDetails.facilitySummaryListTable(3).isUsingFacilityEndDateAction().contains('Change');

      // check that header updated to include this facility
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
    });

    it('should be able to submit to checker after making changes', () => {
      cy.clickSubmitButton();
      cy.clickSubmitButton();
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
context('Submit to UKEF with unissued to issued facilities - feature flag enabled', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
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
      statusBanner.bannerStatus().contains("Ready for Checker's approval");
    });

    it('should not be able to edit any facilities', () => {
      // 1st facility table - makes sure no action buttons exist (change or add)
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).issueDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(0).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // second facility
      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).issueDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(1).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // third facility
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(2).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      // forth facility table
      applicationPreview.facilitySummaryListTable(3).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).issueDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).coverStartDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(3).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationDetails.facilitySummaryListTable(3).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
    });

    it('submit to ukef and return to maker buttons exist and able to return to maker', () => {
      submitButton().should('exist');
      cy.clickSubmitButton();
      applicationSubmission.confirmSubmissionCheckbox().click();
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitleFacilities().contains('Issued facilities submitted to UKEF');
      // check that correct text is displayed under confirmation panel
      applicationSubmission.confirmationText().contains("We'll send you a confirmation email shortly, once we've acknowledged your issued facilities.");
    });
  });
  /**
   * Check the activity feed for facility changed to issued activity
   * Should contain Bank facility stage changed
   * Should contain links and tags
   * Should not contain already issued facilities
   */
  describe('Check the activity feed shows issued facilities activity', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('activity tab contains the correct elements and redirects to correct place on clicking facility link', () => {
      applicationActivities.subNavigationBarActivities().click();
      applicationActivities.activityTimeline().contains('Bank facility stage changed');

      // first facility issued activity
      applicationActivities
        .facilityActivityChangedBy(unissuedFacilitiesArray[0].ukefFacilityId)
        .contains(`Changed by ${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      applicationActivities
        .facilityActivityCheckedBy(unissuedFacilitiesArray[0].ukefFacilityId)
        .contains(`Checked by ${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
      applicationActivities.previousStatusTag(unissuedFacilitiesArray[0].ukefFacilityId).contains('Unissued');
      applicationActivities.newStatusTag(unissuedFacilitiesArray[0].ukefFacilityId).contains('Issued');
      applicationActivities
        .facilityActivityLink(unissuedFacilitiesArray[0].ukefFacilityId)
        .contains(`${unissuedFacilitiesArray[0].type} facility ${unissuedFacilitiesArray[0].ukefFacilityId}`);
      applicationActivities.facilityActivityLink(unissuedFacilitiesArray[0].ukefFacilityId).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}#${unissuedFacilitiesArray[0]._id}`));

      applicationActivities.subNavigationBarActivities().click();

      // 2nd facility issued activity
      applicationActivities
        .facilityActivityChangedBy(unissuedFacilitiesArray[1].ukefFacilityId)
        .contains(`Changed by ${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      applicationActivities
        .facilityActivityCheckedBy(unissuedFacilitiesArray[1].ukefFacilityId)
        .contains(`Checked by ${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
      applicationActivities.previousStatusTag(unissuedFacilitiesArray[1].ukefFacilityId).contains('Unissued');
      applicationActivities.newStatusTag(unissuedFacilitiesArray[1].ukefFacilityId).contains('Issued');
      applicationActivities
        .facilityActivityLink(unissuedFacilitiesArray[1].ukefFacilityId)
        .contains(`${unissuedFacilitiesArray[1].type} facility ${unissuedFacilitiesArray[1].ukefFacilityId}`);
      applicationActivities.facilityActivityLink(unissuedFacilitiesArray[1].ukefFacilityId).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}#${unissuedFacilitiesArray[1]._id}`));

      applicationActivities.subNavigationBarActivities().click();

      // 3rd facility issued activity
      applicationActivities
        .facilityActivityChangedBy(unissuedFacilitiesArray[2].ukefFacilityId)
        .contains(`Changed by ${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
      applicationActivities
        .facilityActivityCheckedBy(unissuedFacilitiesArray[2].ukefFacilityId)
        .contains(`Checked by ${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);
      applicationActivities.previousStatusTag(unissuedFacilitiesArray[2].ukefFacilityId).contains('Unissued');
      applicationActivities.newStatusTag(unissuedFacilitiesArray[2].ukefFacilityId).contains('Issued');
      applicationActivities
        .facilityActivityLink(unissuedFacilitiesArray[2].ukefFacilityId)
        .contains(`${unissuedFacilitiesArray[2].type} facility ${unissuedFacilitiesArray[2].ukefFacilityId}`);
      applicationActivities.facilityActivityLink(unissuedFacilitiesArray[2].ukefFacilityId).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}#${unissuedFacilitiesArray[2]._id}`));
    });

    it('should not contain already issued facility or submission message', () => {
      applicationActivities.subNavigationBarActivities().click();

      applicationActivities.activityTimeline().should('not.contain', PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION);
      applicationActivities.activityTimeline().should('not.contain', PORTAL_ACTIVITY_LABEL.MIA_SUBMISSION);
      applicationActivities.activityTimeline().should('not.contain', PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION);

      // already issued facility should not appear in the activity list
      applicationActivities.facilityActivityChangedBy(issuedCashFacility.ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityCheckedBy(issuedCashFacility.ukefFacilityId).should('not.exist');
      applicationActivities.previousStatusTag(issuedCashFacility.ukefFacilityId).should('not.exist');
      applicationActivities.newStatusTag(issuedCashFacility.ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityLink(issuedCashFacility.ukefFacilityId).should('not.exist');
    });
  });
});
