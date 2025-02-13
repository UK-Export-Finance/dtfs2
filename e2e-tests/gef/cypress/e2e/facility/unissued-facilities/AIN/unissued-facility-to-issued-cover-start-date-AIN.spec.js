import relative from '../../../relativeURL';
import CONSTANTS from '../../../../fixtures/constants';
import { threeDaysAgoPlusThreeMonths, threeDaysAgo, threeMonthsOneDay } from '../../../../../../e2e-fixtures/dateConstants';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { anUnissuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { mainHeading } from '../../../partials';
import applicationPreview from '../../../pages/application-preview';
import unissuedFacilityTable from '../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../pages/unissued-facilities-about-facility';
import statusBanner from '../../../pages/application-status-banner';

let dealId;
let token;
let facilityOneId;

const unissuedCashFacility = anUnissuedCashFacility({ facilityEndDateEnabled: true });

const unissuedFacilitiesArray = [unissuedCashFacility];

context('Unissued Facilities AIN - change all to issued from unissued table', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_AIN_DRAFT).then(() => {
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              facilityOneId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedCashFacility);
            });
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF);
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
    it('task comment box exists with correct header and unissued facilities link', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
      applicationPreview.automaticCoverCriteria().should('exist');
    });

    it('clicking unissued facilities link takes you to unissued facility list page', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      unissuedFacilityTable.updateFacilitiesLater().contains('Update facility stage later');
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);

      const deadlineForIssuing = threeDaysAgoPlusThreeMonths.dd_MMM_yyyy;
      unissuedFacilityTable.rows().contains(deadlineForIssuing);

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

    it('update facility page should have correct titles and text', () => {
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

      aboutFacilityUnissued.isUsingFacilityEndDateYes().should('be.checked');
      aboutFacilityUnissued.isUsingFacilityEndDateNo().should('not.be.checked');
    });

    it('Should not throw error upon user defined cover start date input when cover start date is set to issuance date', () => {
      // Navigate to the unissued facility
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      // Issue date set to today's date
      cy.completeDateFormFields({ idPrefix: 'issue-date' });

      // Cover start date to user defined date - Three days in the past
      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo.date });

      // Cover end date to user defined date
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      // Changing cover start date to issuance date
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();
      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonthsOneDay.date });

      cy.clickContinueButton();

      // Success banner
      unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility stages are now updated');
    });
  });
});
