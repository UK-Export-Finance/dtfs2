import { format } from 'date-fns';

import relative from '../../../../relativeURL';

import CONSTANTS from '../../../../../fixtures/constants';

import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

import { MOCK_APPLICATION_MIN } from '../../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { mainHeading, errorSummary } from '../../../../partials';
import applicationPreview from '../../../../pages/application-preview';
import unissuedFacilityTable from '../../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../../pages/unissued-facilities-about-facility';
import statusBanner from '../../../../pages/application-status-banner';

let dealId;
let token;
let facilityOneId;

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities();

const unissuedFacilitiesArray = [unissuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover];

context('Unissued Facilities MIN - change all to issued from unissued table', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIN).then(() => {
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

    // ensures the task comment box exists with correct headers and link
    it('task comment box exists with correct header and unissued facilities link and shows type as MIN', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIN);
      applicationPreview.automaticCoverSummaryList().contains('No - submit as a manual inclusion application');
      applicationPreview.automaticCoverCriteria().should('exist');
    });

    /* application preview should not have unlocked ability to change unissued facilities until
       at least 1 changed from unissued table
    */
    it('facilities table does not contain any add or change links as have not changed any facilities to issued yet', () => {
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedCashFacilityWith20MonthsOfCover.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).issueDateAction().should('not.exist');

      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
    });

    it('clicking unissued facilities link takes you to unissued facility list page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.rows().contains(format(dateConstants.threeMonths, 'dd MMM yyyy'));
      statusBanner.applicationBanner().should('exist');
    });

    it('clicking back or update later takes you back to application preview', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));

      applicationPreview.unissuedFacilitiesReviewLink().click();
      // ensures that nothing has changed
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
    });

    // clicking update on unissued-facilities table
    it('clicking on update should take you to the update facility page with correct url', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
    });

    it('update facility page should have correct titles and text (only name should be prepopulated', () => {
      // when entering no dates
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.clickContinueButton();

      aboutFacilityUnissued.issueDateError().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionError().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.coverEndDateError().contains('Enter a cover end date');
      errorSummary().contains('Enter the date you issued the facility to the exporter');
      errorSummary().contains('Select if you want UKEF cover to start on the day you issue the facility');
      errorSummary().contains('Enter a cover end date');

      // entering date in the past for issue date
      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.fourDaysAgoDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.fourDaysAgoMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.fourDaysAgoYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.issueDateError().contains('The issue date must not be before the date of the inclusion notice submission date');
      errorSummary().contains('The issue date must not be before the date of the inclusion notice submission date');

      // entering issue date in the future
      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.tomorrowYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.issueDateError().contains('The issue date cannot be in the future');
      errorSummary().contains('The issue date cannot be in the future');

      cy.keyboardInput(aboutFacilityUnissued.issueDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.issueDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.issueDateYear(), dateConstants.todayYear);

      // entering cover start date before issue date
      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.threeDaysDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.threeDaysMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.threeDaysYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.coverStartDateError().contains('Cover start date cannot be before the issue date');
      errorSummary().contains('Cover start date cannot be before the issue date');

      // entering cover start date beyond 3 months from notice date
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.threeMonthsOneDayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.threeMonthsOneDayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.threeMonthsOneDayYear);
      cy.clickContinueButton();
      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');

      // coverEnd date before coverStartDate
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.twoMonthsDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.twoMonthsMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.twoMonthsYear);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.twentyEightDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.twentyEightMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.twentyEightYear);
      cy.clickContinueButton();
      errorSummary().contains('Cover end date cannot be before cover start date');

      // coverEnd date same as coverStartDate
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverStartDateYear(), dateConstants.todayYear);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateDay(), dateConstants.todayDay);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(aboutFacilityUnissued.coverEndDateYear(), dateConstants.todayYear);
      cy.clickContinueButton();
      errorSummary().contains('The cover end date must be after the cover start date');
    });
  });
});
