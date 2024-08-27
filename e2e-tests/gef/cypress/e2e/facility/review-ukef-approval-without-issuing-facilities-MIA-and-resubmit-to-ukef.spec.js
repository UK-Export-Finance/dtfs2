import relative from '../relativeURL';

import CONSTANTS from '../../fixtures/constants';

import dateConstants from '../../../../e2e-fixtures/dateConstants';

import { MOCK_APPLICATION_MIA, MOCK_APPLICATION_MIA_DRAFT, UKEF_DECISION, underwriterManagersDecision } from '../../fixtures/mocks/mock-deals';

import { BANK1_MAKER1, BANK1_CHECKER1, BANK1_CHECKER1_WITH_MOCK_ID } from '../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_FACILITY_ONE, MOCK_FACILITY_TWO_NULL_MIA, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR } from '../../fixtures/mocks/mock-facilities';

import { toTitleCase } from '../../fixtures/helpers';

import { continueButton, errorSummary, submitButton } from '../partials';
import applicationPreview from '../pages/application-preview';
import unissuedFacilityTable from '../pages/unissued-facilities';
import applicationSubmission from '../pages/application-submission';
import statusBanner from '../pages/application-status-banner';
import coverStartDate from '../pages/cover-start-date';
import applicationDetails from '../pages/application-details';
import applicationActivities from '../pages/application-activities';

let dealId;
let token;
let facilityTwoId;

const unissuedFacilitiesArray = [MOCK_FACILITY_ONE, MOCK_FACILITY_THREE, MOCK_FACILITY_FOUR];

const issuedFacilities = [MOCK_FACILITY_TWO_NULL_MIA];

context('Review UKEF decision MIA -> confirm coverStartDate without issuing facilities', () => {
  before(() => {
    cy.apiLogin(BANK1_MAKER1)
      .then((t) => {
        token = t;
      })
      .then(() => {
        // creates application and inserts facilities and changes status
        cy.apiCreateApplication(BANK1_MAKER1, token).then(({ body }) => {
          dealId = body._id;
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIA_DRAFT);
          cy.submitDealAfterUkefIds(dealId, 'GEF', BANK1_CHECKER1_WITH_MOCK_ID);
          cy.apiUpdateApplication(dealId, token, MOCK_APPLICATION_MIA).then(() => {
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) => {
              facilityTwoId = facility.body.details._id;
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO_NULL_MIA);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_FOUR),
            );
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
            cy.addCommentObjToDeal(dealId, CONSTANTS.DEAL_COMMENT_TYPE_PORTAL.UKEF_DECISION, UKEF_DECISION);
          });
          cy.addUnderwriterCommentToTfm(dealId, underwriterManagersDecision);
        });
      });
  });

  describe('Review UKEF decision', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('relevant fields are locked ', () => {
      //  makes sure no action buttons exist (change or add)
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

      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

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

    it('checks correct status and review UKEF decision link exist', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
      applicationPreview.ukefReview().contains('Review UKEF decision');
      applicationPreview
        .ukefReviewLink()
        .invoke('attr', 'href')
        .then((href) => {
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
      continueButton().click();
      errorSummary().contains('Select yes if you want to accept the conditions and proceed with UKEF cover.');
      applicationPreview.reviewDecisionError('Select yes if you want to accept the conditions and proceed with UKEF cover.');

      applicationPreview.reviewDecisionTrue().click();
      continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/cover-start-date`));

      coverStartDate.rows().should('have.length', issuedFacilities.length);
      coverStartDate.updateIndividualCoverStartDateButton(0).click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));
      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');
    });

    it('entering cover date the same date as the coverEndDate should show an error', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));

      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');

      coverStartDate.coverStartDateNo().click();

      coverStartDate.coverStartDateDay().clear();
      coverStartDate.coverStartDateDay().type(dateConstants.tomorrowDay);
      coverStartDate.coverStartDateMonth().clear();
      coverStartDate.coverStartDateMonth().type(dateConstants.tomorrowMonth);
      coverStartDate.coverStartDateYear().clear();
      coverStartDate.coverStartDateYear().type(dateConstants.tomorrowYear);

      continueButton().click();

      errorSummary().contains('The cover start date must be before the cover end date');
      coverStartDate.coverStartDateNo().click();
      coverStartDate.errorInput().contains('The cover start date must be before the cover end date');
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

      continueButton().click();

      errorSummary().contains('Cover date cannot be in the past');
      coverStartDate.coverStartDateNo().click();
      coverStartDate.errorInput().contains('Cover date cannot be in the past');
    });

    it('entering cover date over three months away on confirm cover start date shows an error', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));
      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');

      coverStartDate.coverStartDateNo().click();

      coverStartDate.coverStartDateDay().clear();
      coverStartDate.coverStartDateDay().type(dateConstants.threeMonthsOneDayDay);
      coverStartDate.coverStartDateMonth().clear();
      coverStartDate.coverStartDateMonth().type(dateConstants.threeMonthsOneDayMonth);
      coverStartDate.coverStartDateYear().clear();
      coverStartDate.coverStartDateYear().type(dateConstants.threeMonthsOneDayYear);

      continueButton().click();

      errorSummary().contains('Cover date must be within 3 months');
      coverStartDate.coverStartDateNo().click();
      coverStartDate.errorInput().contains('Cover date must be within 3 months');
    });

    it('entering cover date correctly shows success message and redirects to unissued facilities table and update facilities later', () => {
      cy.visit(relative(`/gef/application-details/${dealId}/${facilityTwoId}/confirm-cover-start-date`));

      coverStartDate.coverStartDateScreen().contains('Do you want UKEF cover to start when the notice is submitted to UKEF?');

      coverStartDate.coverStartDateNo().click();

      coverStartDate.coverStartDateDay().clear();
      coverStartDate.coverStartDateDay().type(dateConstants.todayDay);
      coverStartDate.coverStartDateMonth().clear();
      coverStartDate.coverStartDateMonth().type(dateConstants.todayMonth);
      coverStartDate.coverStartDateYear().clear();
      coverStartDate.coverStartDateYear().type(dateConstants.todayYear);

      continueButton().click();

      coverStartDate.coverStartDateSuccess().contains('All cover start dates confirmed for issued facilities');
      continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities`));
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length);
      unissuedFacilityTable.updateFacilitiesLater().click();

      // link on application preview exists
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
    });

    it('pressing submit button takes you to submit page and with correct panel once submitted to checker', () => {
      // check correct accepting conditions message is shown
      applicationPreview.acceptMIADecision().contains('You are proceeding with UKEF cover and accepting the following conditions:');

      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission
        .submissionText()
        .contains(`Someone at your bank must check your ${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)} before they can submit it to UKEF.`);
      submitButton().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
      applicationSubmission.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIA)} submitted for checking at your bank`);
    });
  });
});

context('Return to maker', () => {
  describe('Check all fields are populated and return to maker', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show correct heading for reviewing UKEF decision', () => {
      applicationPreview.miaStageChecker().contains('Check manual inclusion application before submitting to UKEF');
      applicationPreview.acceptMIADecision().contains('You are accepting the following conditions:');
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL);
    });

    it('should not be able to edit any facilities', () => {
      // 1st facility table - makes sure no action buttons exist (change or add)
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      // second facility
      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

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

      // forth facility
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
      submitButton().click();
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
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('Statuses and banners should correct text', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED);
      applicationPreview.acceptMIADecision().contains('You are proceeding with UKEF cover and accepting the following conditions:');
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
    });

    it('should not have all fields unlocked', () => {
      // should not be able to add or delete facilities
      applicationDetails.addCashFacilityButton().should('not.exist');
      applicationDetails.addContingentFacilityButton().should('not.exist');
      applicationDetails.deleteFacilityLink().should('not.exist');

      // facility which confirmed cover
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      // 1st facility table - make sure change exists on issue action
      applicationDetails.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      // second facility - make sure change exists on issue action
      applicationDetails.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).valueAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(1).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      // forth facility has change links as changedToIssued
      applicationDetails.facilitySummaryListTable(3).nameAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationDetails.facilitySummaryListTable(3).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
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
      // should not be able to edit supporting info
      applicationDetails.supportingInfoListRowAction(0, 0).should('not.exist');
      applicationDetails.supportingInfoListRowAction(0, 1).should('not.exist');
    });

    it('should be able to submit to checker after making changes', () => {
      submitButton().click();
      submitButton().click();
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
      cy.saveSession();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('should show changed facilities in task comments box with correct heading for accepting conditions', () => {
      applicationPreview.acceptMIADecision().contains('You are accepting the following conditions:');
    });

    it('should show correct status', () => {
      statusBanner.bannerStatus().contains(CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL);
    });

    it('submit to ukef and it should change to MIN (from MIA)', () => {
      submitButton().should('exist');
      submitButton().click();
      applicationSubmission.confirmSubmissionCheckbox().click();
      submitButton().click();
      applicationSubmission.confirmationPanelTitle().contains(`${toTitleCase(CONSTANTS.DEAL_SUBMISSION_TYPE.MIN)} submitted to UKEF`);
      // check that correct text is displayed under confirmation panel
      applicationSubmission.confirmationText().contains("We'll send you a confirmation email shortly, once we've acknowledged your inclusion notice.");
    });
  });
});

/**
 * Check the activity feed for facility changed to issued activity
 * Should contain Bank facility stage changed
 * Should contain links and tags
 * Should not contain already issued facilities
 */
context('Check activity feed', () => {
  describe('Check activity feed contains MIA->MIN activity and does not contain any issued facilities activities', () => {
    beforeEach(() => {
      cy.saveSession();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    it('activity tab contains the correct elements and redirects to correct place on clicking facility link', () => {
      applicationActivities.subNavigationBarActivities().click();

      // contains submission message
      applicationActivities
        .activityTimeline()
        .contains(`${CONSTANTS.PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION} by ${BANK1_CHECKER1.firstname} ${BANK1_CHECKER1.surname}`);

      applicationActivities.subNavigationBarActivities().click();
    });

    it('should not contain already issued facility or unissued facilities', () => {
      applicationActivities.subNavigationBarActivities().click();

      applicationActivities.activityTimeline().should('not.contain', 'Bank facility stage changed');

      // already issued facility should not appear in the activity list
      applicationActivities.facilityActivityChangedBy(MOCK_FACILITY_TWO_NULL_MIA.ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityCheckedBy(MOCK_FACILITY_TWO_NULL_MIA.ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityUnissuedTag(MOCK_FACILITY_TWO_NULL_MIA.ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityIssuedTag(MOCK_FACILITY_TWO_NULL_MIA.ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityLink(MOCK_FACILITY_TWO_NULL_MIA.ukefFacilityId).should('not.exist');

      // 1st facility unissued so should not show up
      applicationActivities.facilityActivityChangedBy(unissuedFacilitiesArray[0].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityCheckedBy(unissuedFacilitiesArray[0].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityUnissuedTag(unissuedFacilitiesArray[0].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityIssuedTag(unissuedFacilitiesArray[0].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityLink(unissuedFacilitiesArray[0].ukefFacilityId).should('not.exist');

      // 2nd facility unissued so should not show up
      applicationActivities.facilityActivityChangedBy(unissuedFacilitiesArray[1].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityCheckedBy(unissuedFacilitiesArray[1].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityUnissuedTag(unissuedFacilitiesArray[1].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityIssuedTag(unissuedFacilitiesArray[1].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityLink(unissuedFacilitiesArray[1].ukefFacilityId).should('not.exist');

      applicationActivities.subNavigationBarActivities().click();

      // 3rd facility unissued so should not show up
      applicationActivities.facilityActivityChangedBy(unissuedFacilitiesArray[2].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityCheckedBy(unissuedFacilitiesArray[2].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityUnissuedTag(unissuedFacilitiesArray[2].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityIssuedTag(unissuedFacilitiesArray[2].ukefFacilityId).should('not.exist');
      applicationActivities.facilityActivityLink(unissuedFacilitiesArray[2].ukefFacilityId).should('not.exist');
    });
  });
});
