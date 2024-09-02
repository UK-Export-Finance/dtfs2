import { format } from 'date-fns';

import relative from '../../relativeURL';

import CONSTANTS from '../../../fixtures/constants';

import dateConstants from '../../../../../e2e-fixtures/dateConstants';

import { MOCK_APPLICATION_AIN } from '../../../fixtures/mocks/mock-deals';
import { MOCK_FACILITY_ONE, MOCK_FACILITY_TWO, MOCK_FACILITY_THREE } from '../../../fixtures/mocks/mock-facilities';
import applicationPreview from '../../pages/application-preview';
import unissuedFacilityTable from '../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../pages/unissued-facilities-about-facility';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import statusBanner from '../../pages/application-status-banner';
import facilities from '../../pages/facilities';
import applicationSubmission from '../../pages/application-submission';
import returnToMaker from '../../pages/return-to-maker';
import facilityEndDate from '../../pages/facility-end-date';
import bankReviewDate from '../../pages/bank-review-date';

let dealId;
let token;
let facilityOneId;

const unissuedFacilitiesArray = [MOCK_FACILITY_ONE, MOCK_FACILITY_THREE];

const facilityEndDateEnabled = Number(Cypress.env('GEF_DEAL_VERSION')) >= 1;

context('Change issued facilities back to unissued (changed to issued facilities post submission)', () => {
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
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_ONE);
            });
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_TWO),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, MOCK_FACILITY_THREE),
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

    //   // ensures the task comment box exists with correct headers and link
    it('task comment box exists with correct header and unissued facilities link', () => {
      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
      applicationPreview.mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
      applicationPreview.automaticCoverCriteria().should('exist');
    });

    /* application preview should not have unlocked ability to change unissued facilities until
         at least 1 changed from unissued table
      */
    it('facilities table does not contain any add or change links as have not changed any facilities to issued yet', () => {
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(MOCK_FACILITY_THREE.name);
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
      unissuedFacilityTable.rows().contains(format(dateConstants.threeDaysAgoPlusMonth, 'dd MMM yyyy'));
      statusBanner.applicationBanner().should('exist');
    });

    // clicking update on unissued-facilities table
    it('clicking on update should take you to the update facility page with correct url', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/about`));
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

      if (facilityEndDateEnabled) {
        aboutFacilityUnissued.isUsingFacilityEndDateYes().click();
      }

      aboutFacilityUnissued.continueButton().click();

      if (facilityEndDateEnabled) {
        facilityEndDate.facilityEndDateDay().clear().type(dateConstants.threeMonthsOneDayDay);
        facilityEndDate.facilityEndDateMonth().clear().type(dateConstants.threeMonthsOneDayMonth);
        facilityEndDate.facilityEndDateYear().clear().type(dateConstants.threeMonthsOneDayYear);
        facilityEndDate.continueButton().click();
      }

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

      if (facilityEndDateEnabled) {
        aboutFacilityUnissued.isUsingFacilityEndDateNo().click();
      }

      aboutFacilityUnissued.continueButton().click();

      if (facilityEndDateEnabled) {
        bankReviewDate.fillInBankReviewDate(dateConstants.threeMonths);
        bankReviewDate.continueButton().click();
      }

      unissuedFacilityTable.rows().should('have.length', 0);
      unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility stages are now updated');
      unissuedFacilityTable.continueButton().should('exist');
      // exists since all unissued updated from table
      unissuedFacilityTable.continueButton().click();
    });

    // task comments box should show facilities names have changed to unissued
    it('preview review facility stage has correct headers and shows all 2 updated facilities and submit button should be visible', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    /* should be able to change dates and unissue on facility that has changed to issued */
    it('facility table should have change links on the changed to issued facilities', () => {
      // to check date format
      const issuedDate = format(dateConstants.today, 'd MMMM yyyy');
      const coverStart = format(dateConstants.twoMonths, 'd MMMM yyyy');
      const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');

      // should be able to change facility three as changed to issued
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(MOCK_FACILITY_THREE.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(0).issueDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).coverStartDateValue().contains(coverStart);
      applicationPreview.facilitySummaryListTable(0).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).coverEndDateValue().contains(coverEnd);
      applicationPreview.facilitySummaryListTable(0).coverEndDateAction().contains('Change');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateValue().contains('No');
        applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateAction().contains('Change');
      }

      // should not be able to change facility two has previously issued (not changed from unissued to issued)
      applicationPreview.facilitySummaryListTable(1).nameValue().contains(MOCK_FACILITY_TWO.name);
      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).issueDateAction().should('not.exist');
      applicationPreview.facilitySummaryListTable(1).coverStartDateValue().contains('Date you submit the notice');
      applicationPreview.facilitySummaryListTable(1).coverStartDateAction().should('have.class', 'govuk-!-display-none');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(1).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
      }
    });

    // checks that can unissue a changed to issued facility
    it('clicking change on issued should take you to hasBeenIssued page with different url', () => {
      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

      facilities.hasBeenIssuedHeading().contains('Has your bank already issued this cash facility to the exporter?');
      facilities.hasBeenIssuedRadioYesRadioButton().should('exist');
      // check that this box is checked (as already issued)
      facilities
        .hasBeenIssuedRadioYesRadioButton()
        .invoke('attr', 'value')
        .then((value) => {
          expect(value).to.equal('true');
        });

      facilities
        .hasBeenIssuedRadioNoRadioButton()
        .invoke('attr', 'value')
        .then((value) => {
          expect(value).to.equal('false');
        });
      facilities.continueButton().should('exist');
      facilities.backLink().should('exist');
      facilities.cancelLink().should('exist');
      facilities.headingCaption().should('not.exist');
    });

    it('pressing back, cancel or yes should not edit the facility and take you back to details page', () => {
      const issuedDate = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
      const coverStart = format(dateConstants.threeDaysAgo, 'd MMMM yyyy');
      const coverEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');
      const facilityEnd = format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy');
      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

      facilities.backLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(2).issueDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverStartDateValue().contains(coverStart);
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverEndDateValue().contains(coverEnd);
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().contains('Change');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateValue().contains('Yes');
        applicationPreview.facilitySummaryListTable(2).facilityEndDateValue().contains(facilityEnd);
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().contains('Change');
      }

      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();
      facilities.cancelLink().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(2).issueDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverStartDateValue().contains(coverStart);
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverEndDateValue().contains(coverEnd);
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().contains('Change');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateValue().contains('Yes');
        applicationPreview.facilitySummaryListTable(2).facilityEndDateValue().contains(facilityEnd);
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().contains('Change');
      }

      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();
      facilities.continueButton().click();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(2).issueDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverStartDateValue().contains(coverStart);
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).coverEndDateValue().contains(coverEnd);
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().contains('Change');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateValue().contains('Yes');
        applicationPreview.facilitySummaryListTable(2).facilityEndDateValue().contains(facilityEnd);
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().contains('Change');
      }
    });

    it('changing the facility to unissued should remove it from the list of issued facilities and remove dates', () => {
      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

      facilities.hasBeenIssuedRadioNoRadioButton().click();
      facilities.continueButton().click();

      applicationPreview.facilitySummaryListTable(2).nameValue().contains(MOCK_FACILITY_ONE.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Unissued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).monthsOfCoverValue().contains(MOCK_FACILITY_ONE.monthsOfCover);
      applicationPreview.facilitySummaryListTable(2).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).dayCountBasisAction().should('have.class', 'govuk-!-display-none');
      // check that these should not exist as should be removed
      applicationPreview.facilitySummaryListTable(2).issueDateAction().should('not.exist');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('not.exist');
      applicationPreview.facilitySummaryListTable(2).coverEndDateAction().should('not.exist');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
        applicationPreview.facilitySummaryListTable(2).facilityEndDateAction().should('have.class', 'govuk-!-display-none');
      }

      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().should('not.contain', unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    it('changing all facilities to unissued takes you back to initial view unissued facilities page', () => {
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(MOCK_FACILITY_THREE.name);
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().click();

      facilities.hasBeenIssuedRadioNoRadioButton().click();
      facilities.continueButton().click();
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(MOCK_FACILITY_THREE.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedValue().contains('Unissued');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverValue().contains(MOCK_FACILITY_THREE.monthsOfCover);
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      if (facilityEndDateEnabled) {
        applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
      }

      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
    });

    it('changing to unissued when returning to maker should hide submit button if no issued facilities', () => {
      // issue facility
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

      if (facilityEndDateEnabled) {
        aboutFacilityUnissued.isUsingFacilityEndDateYes().click();
      }

      aboutFacilityUnissued.continueButton().click();

      if (facilityEndDateEnabled) {
        facilityEndDate.facilityEndDateDay().clear().type(dateConstants.threeMonthsOneDayDay);
        facilityEndDate.facilityEndDateMonth().clear().type(dateConstants.threeMonthsOneDayMonth);
        facilityEndDate.facilityEndDateYear().clear().type(dateConstants.threeMonthsOneDayYear);
        facilityEndDate.continueButton().click();
      }

      unissuedFacilityTable.updateFacilitiesLater().click();

      // submit to checker
      applicationPreview.submitButtonPostApproval().click();
      applicationSubmission.submitButton().click();
      // log in
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
      // return to maker
      applicationPreview.returnButton().click();
      returnToMaker.submitButton().click();

      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
      // unissue facility
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();
      facilities.hasBeenIssuedRadioNoRadioButton().click();
      facilities.continueButton().click();

      applicationPreview.submitButton().should('not.exist');
    });
  });
});
