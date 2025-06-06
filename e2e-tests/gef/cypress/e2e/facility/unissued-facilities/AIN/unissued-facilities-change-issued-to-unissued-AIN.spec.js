import relative from '../../../relativeURL';
import CONSTANTS from '../../../../fixtures/constants';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../fixtures/mocks/mock-deals';
import { multipleMockGefFacilities } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { backLink, cancelLink, continueButton, headingCaption, mainHeading, submitButton } from '../../../partials';
import applicationPreview from '../../../pages/application-preview';
import unissuedFacilityTable from '../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../pages/unissued-facilities-about-facility';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { acbsReconciliation } from '../../../../../../e2e-fixtures/acbs';
import statusBanner from '../../../pages/application-status-banner';
import facilities from '../../../pages/facilities';
import { threeDaysAgo, threeDaysAgoPlusThreeMonths, threeMonths, threeMonthsOneDay, today, twoMonths } from '../../../../../../e2e-fixtures/dateConstants';

let dealId;
let token;
let facilityOneId;

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

const unissuedFacilitiesArray = [unissuedCashFacility, unissuedContingentFacility];

context('Change issued facilities back to unissued AIN (changed to issued facilities post submission)', () => {
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
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CASH, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, issuedCashFacility),
            );
            cy.apiCreateFacility(dealId, CONSTANTS.FACILITY_TYPE.CONTINGENT, token).then((facility) =>
              cy.apiUpdateFacility(facility.body.details._id, token, unissuedContingentFacility),
            );
            cy.apiSetApplicationStatus(dealId, token, CONSTANTS.DEAL_STATUS.SUBMITTED_TO_UKEF);

            // Add ACBS object to TFM
            cy.putTfmDeal(dealId, {
              tfm: {
                ...acbsReconciliation,
              },
            });
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
      mainHeading().contains(CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
      applicationPreview.automaticCoverSummaryList().contains('Yes - submit as an automatic inclusion notice');
      applicationPreview.automaticCoverCriteria().should('exist');
    });

    /* application preview should not have unlocked ability to change unissued facilities until
         at least 1 changed from unissued table
      */
    it('facilities table does not contain any add or change links as have not changed any facilities to issued yet', () => {
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedContingentFacility.name);
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

      const deadlineForIssuing = threeDaysAgoPlusThreeMonths.dd_MMM_yyyy;
      unissuedFacilityTable.rows().contains(deadlineForIssuing);

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

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: threeDaysAgo.date });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonthsOneDay.date });
      cy.clickContinueButton();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[0].name} is updated`);
      // checks the facility has been removed from unissued list
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 1);
      // should not be able to continue until all facilities issued - instead use update later to go to preview
      continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date' });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: twoMonths.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: threeMonths.date });

      cy.clickContinueButton();

      unissuedFacilityTable.rows().should('have.length', 0);
      unissuedFacilityTable.allUnissuedUpdatedSuccess().contains('Facility stages are now updated');
      continueButton().should('exist');
      // exists since all unissued updated from table
      cy.clickContinueButton();
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
      const issuedDate = today.d_MMMM_yyyy;
      const coverStart = twoMonths.d_MMMM_yyyy;
      const coverEnd = threeMonthsOneDay.d_MMMM_yyyy;

      // should be able to change facility three as changed to issued
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedContingentFacility.name);
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

      applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateValue().contains('No');
      applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateAction().contains('Change');

      // should not be able to change facility two has previously issued (not changed from unissued to issued)
      applicationPreview.facilitySummaryListTable(1).nameValue().contains(issuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(1).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(1).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(1).issueDateAction().should('not.exist');
      applicationPreview.facilitySummaryListTable(1).coverStartDateValue().contains('Date you submit the notice');
      applicationPreview.facilitySummaryListTable(1).coverStartDateAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(1).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
    });

    // checks that can unissue a changed to issued facility
    it('clicking change on issued should take you to hasBeenIssued page with different url', () => {
      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
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
      continueButton().should('exist');
      backLink().should('exist');
      cancelLink().should('exist');
      headingCaption().should('not.exist');
    });

    it('pressing back, cancel or yes should not edit the facility and take you back to details page', () => {
      const issuedDate = threeDaysAgo.d_MMMM_yyyy;
      const coverStart = threeDaysAgo.d_MMMM_yyyy;
      const coverEnd = threeMonthsOneDay.d_MMMM_yyyy;
      const facilityEnd = threeMonthsOneDay.d_MMMM_yyyy;
      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
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

      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateValue().contains('Yes');
      applicationPreview.facilitySummaryListTable(2).facilityEndDateValue().contains(facilityEnd);
      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().contains('Change');

      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();
      cy.clickCancelLink();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
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

      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateValue().contains('Yes');
      applicationPreview.facilitySummaryListTable(2).facilityEndDateValue().contains(facilityEnd);
      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().contains('Change');

      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();
      cy.clickContinueButton();
      cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
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

      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateValue().contains('Yes');
      applicationPreview.facilitySummaryListTable(2).facilityEndDateValue().contains(facilityEnd);
      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().contains('Change');
    });

    it('changing the facility to unissued should remove it from the list of issued facilities and remove dates', () => {
      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change-to-unissued`));

      facilities.hasBeenIssuedRadioNoRadioButton().click();
      cy.clickContinueButton();

      applicationPreview.facilitySummaryListTable(2).nameValue().contains(unissuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Unissued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(2).monthsOfCoverValue().contains(unissuedCashFacility.monthsOfCover);
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

      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).facilityEndDateAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().should('not.contain', unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    it('changing all facilities to unissued takes you back to initial view unissued facilities page', () => {
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedContingentFacility.name);
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().click();

      facilities.hasBeenIssuedRadioNoRadioButton().click();
      cy.clickContinueButton();
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedContingentFacility.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedValue().contains('Unissued');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverValue().contains(unissuedContingentFacility.monthsOfCover);
      applicationPreview.facilitySummaryListTable(0).monthsOfCoverAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).facilityProvidedOnAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).valueAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).coverPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).interestPercentageAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).feeFrequencyAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).dayCountBasisAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.unissuedFacilitiesHeader().contains('Update facility stage for unissued facilities');
      applicationPreview.unissuedFacilitiesReviewLink().contains('View unissued facilities');
      applicationPreview.submitButtonPostApproval().should('not.exist');
    });

    it('changing to unissued when returning to maker should hide submit button if no issued facilities', () => {
      // issue facility
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: threeDaysAgo.date });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo.date });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonthsOneDay.date });

      cy.clickContinueButton();

      unissuedFacilityTable.updateFacilitiesLater().click();

      // submit to checker
      applicationPreview.submitButtonPostApproval().click();
      cy.clickSubmitButton();
      // log in
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
      // return to maker
      applicationPreview.returnButton().click();
      cy.clickSubmitButton();

      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
      // unissue facility
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().click();
      facilities.hasBeenIssuedRadioNoRadioButton().click();
      cy.clickContinueButton();

      submitButton().should('not.exist');
    });
  });
});
