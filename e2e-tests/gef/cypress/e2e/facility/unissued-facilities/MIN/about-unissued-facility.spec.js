import { format } from 'date-fns';
import relative from '../../../relativeURL';
import CONSTANTS from '../../../../fixtures/constants';
import { fourDaysAgo, tomorrow, threeDaysAgo, threeMonths, threeMonthsOneDay, twentyEight, twoMonths } from '../../../../../../e2e-fixtures/dateConstants';
import { MOCK_APPLICATION_MIN } from '../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { mainHeading, errorSummary } from '../../../partials';
import applicationPreview from '../../../pages/application-preview';
import unissuedFacilityTable from '../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../pages/unissued-facilities-about-facility';
import statusBanner from '../../../pages/application-status-banner';

let dealId;
let token;
let facilityOneId;

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities();

const unissuedFacilitiesArray = [unissuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover];

context('Unissued Facilities MIN - about unissued facility page', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
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

  describe('About unissued facility page', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('task comment box exists with correct header and unissued facilities link and shows type as MIN', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.MIN);
      applicationPreview.automaticCoverSummaryList().contains('No - submit as a manual inclusion application');
      applicationPreview.automaticCoverCriteria().should('exist');
    });

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
      unissuedFacilityTable.rows().contains(format(threeMonths, 'dd MMM yyyy'));
      statusBanner.applicationBanner().should('exist');
    });

    it('clicking back or update later takes you back to application preview', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));

      applicationPreview.unissuedFacilitiesReviewLink().click();

      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      cy.clickBackLink();
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

      mainHeading().contains("Tell us you've issued this facility");
      aboutFacilityUnissued.facilityNameLabel().contains('Name for this cash facility');
      aboutFacilityUnissued.facilityName().should('have.value', unissuedCashFacility.name);

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

    it('displays error messages when no values provided', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.clickContinueButton();

      aboutFacilityUnissued.issueDateError().contains('Enter the date you issued the facility to the exporter');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionError().contains('Select if you want UKEF cover to start on the day you issue the facility');
      aboutFacilityUnissued.coverEndDateError().contains('Enter a cover end date');
      errorSummary().contains('Enter the date you issued the facility to the exporter');
      errorSummary().contains('Select if you want UKEF cover to start on the day you issue the facility');
      errorSummary().contains('Enter a cover end date');
    });

    it('displays error messages when issue date is before the submission date', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: fourDaysAgo });

      cy.clickContinueButton();

      aboutFacilityUnissued.issueDateError().contains('The issue date must not be before the date of the inclusion notice submission date');
      errorSummary().contains('The issue date must not be before the date of the inclusion notice submission date');
    });

    it('displays error messages when issue date is in the future', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: tomorrow });

      cy.clickContinueButton();

      aboutFacilityUnissued.issueDateError().contains('The issue date cannot be in the future');
      errorSummary().contains('The issue date cannot be in the future');
    });

    it('displays error messages when cover start date is before the issue', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date' });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo });

      cy.clickContinueButton();

      aboutFacilityUnissued.coverStartDateError().contains('Cover start date cannot be before the issue date');
      errorSummary().contains('Cover start date cannot be before the issue date');
    });

    it('displays error messages when cover start date is over 3 months after submission date', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeMonthsOneDay });

      cy.clickContinueButton();

      aboutFacilityUnissued.coverStartDateError().contains('The cover start date must be within 3 months of the inclusion notice submission date');
      errorSummary().contains('The cover start date must be within 3 months of the inclusion notice submission date');
    });

    it('displays error messages when cover end date is before the cover start date', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: twoMonths });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: twentyEight });

      cy.clickContinueButton();

      aboutFacilityUnissued.coverEndDateError().contains('Cover end date cannot be before cover start date');
      errorSummary().contains('Cover end date cannot be before cover start date');
    });

    it('displays error messages when cover end date is same as the cover start date', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();
      cy.completeDateFormFields({ idPrefix: 'cover-start-date' });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date' });

      cy.clickContinueButton();

      aboutFacilityUnissued.coverEndDateError().contains('The cover end date must be after the cover start date');
      errorSummary().contains('The cover end date must be after the cover start date');
    });
  });
});
