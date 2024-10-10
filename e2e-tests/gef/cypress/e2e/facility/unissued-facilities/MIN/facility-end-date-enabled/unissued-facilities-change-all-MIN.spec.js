import { format } from 'date-fns';
import relative from '../../../../relativeURL';
import CONSTANTS from '../../../../../fixtures/constants';
import { threeDaysAgo, threeMonths, threeMonthsOneDay, today, twoMonths } from '../../../../../../../e2e-fixtures/dateConstants';
import { MOCK_APPLICATION_MIN } from '../../../../../fixtures/mocks/mock-deals';
import { BANK1_MAKER1 } from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { multipleMockGefFacilities } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { continueButton } from '../../../../partials';
import applicationPreview from '../../../../pages/application-preview';
import unissuedFacilityTable from '../../../../pages/unissued-facilities';
import aboutFacilityUnissued from '../../../../pages/unissued-facilities-about-facility';
import applicationSubmission from '../../../../pages/application-submission';

let dealId;
let token;
let facilityOneId;

const { unissuedCashFacility, issuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover } = multipleMockGefFacilities({
  facilityEndDateEnabled: true,
});

const unissuedFacilitiesArray = [unissuedCashFacility, unissuedContingentFacility, unissuedCashFacilityWith20MonthsOfCover];

context('Unissued Facilities MIN - change all to issued from unissued table - feature flag enabled', () => {
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

    it('the correct success messages should be displayed after changing facility to issued', () => {
      applicationPreview.unissuedFacilitiesReviewLink().click();
      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date', date: threeDaysAgo });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeDaysAgo });
      cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: threeMonthsOneDay.date });

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/facility-end-date`));

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonths });

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

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: threeMonths });

      cy.clickContinueButton();

      unissuedFacilityTable.successBanner().contains(`${unissuedFacilitiesArray[1].name} is updated`);
      unissuedFacilityTable.rows().should('have.length', unissuedFacilitiesArray.length - 2);
      continueButton().should('not.exist');

      unissuedFacilityTable.updateIndividualFacilityButton(0).click();

      cy.completeDateFormFields({ idPrefix: 'issue-date' });

      aboutFacilityUnissued.shouldCoverStartOnSubmissionNo().click();

      // testing if MIN submission date so can do 3months

      cy.completeDateFormFields({ idPrefix: 'cover-start-date', date: threeMonths });
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
    it('preview review facility stage has correct headers and shows all 3 updated facilities and submit button should be visible', () => {
      applicationPreview.reviewFacilityStage().contains('Review facility stage');
      applicationPreview.updatedUnissuedFacilitiesHeader().contains('The following facility stages have been updated to issued:');
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[0].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[1].name);
      applicationPreview.updatedUnissuedFacilitiesList().contains(unissuedFacilitiesArray[2].name);
      applicationPreview.unissuedFacilitiesReviewLink().should('not.exist');
      applicationPreview.submitButtonPostApproval().should('exist');
    });

    /* should be able to change dates on facility that has changed to issued */
    it('facility table should have change links on the changed to issued facilities', () => {
      // to check date format
      const issuedDate = today.dMMMMyyyy;
      const coverStartThreeMonths = format(threeMonths, 'd MMMM yyyy');
      const coverEnd = threeMonthsOneDay.dMMMMyyyy;

      // should be able to change facility four as changed to issued
      applicationPreview.facilitySummaryListTable(0).nameValue().contains(unissuedCashFacilityWith20MonthsOfCover.name);
      applicationPreview.facilitySummaryListTable(0).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(0).hasBeenIssuedAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).issueDateValue().contains(issuedDate);
      applicationPreview.facilitySummaryListTable(0).issueDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).coverStartDateValue().contains(coverStartThreeMonths);
      applicationPreview.facilitySummaryListTable(0).coverStartDateAction().contains('Change');
      applicationPreview.facilitySummaryListTable(0).coverEndDateValue().contains(coverEnd);
      applicationPreview.facilitySummaryListTable(0).coverEndDateAction().contains('Change');

      applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateValue().contains('No');
      applicationPreview.facilitySummaryListTable(0).isUsingFacilityEndDateAction().contains('Change');

      // should not be able to change facility two has previously issued (not changed from unissued to issued)
      applicationPreview.facilitySummaryListTable(2).nameValue().contains(issuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(2).nameAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).ukefFacilityIdAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedValue().contains('Issued');
      applicationPreview.facilitySummaryListTable(2).hasBeenIssuedAction().should('have.class', 'govuk-!-display-none');
      applicationPreview.facilitySummaryListTable(2).issueDateAction().should('not.exist');
      applicationPreview.facilitySummaryListTable(2).coverStartDateValue().contains('Date you submit the notice');
      applicationPreview.facilitySummaryListTable(2).coverStartDateAction().should('have.class', 'govuk-!-display-none');

      applicationPreview.facilitySummaryListTable(2).isUsingFacilityEndDateAction().should('have.class', 'govuk-!-display-none');
    });

    it('can submit facility when facility end date has been provided', () => {
      const facilityEndDateFormatted = format(threeMonths, 'd MMMM yyyy');

      applicationPreview.facilitySummaryListTable(3).facilityEndDateValue().contains(facilityEndDateFormatted);

      applicationPreview.submitButtonPostApproval();
    });

    it('cannot submit facility without bank review date', () => {
      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateAction().click();

      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${dealId}`));

      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateValue().contains('No');
      applicationPreview.facilitySummaryListTable(3).bankReviewDateValue().contains('Required');

      applicationPreview.submitButtonPostApproval().should('not.exist');
    });

    it('can submit facility when bank review date has been provided', () => {
      const bankReviewDateFormatted = format(threeMonths, 'd MMMM yyyy');

      applicationPreview.facilitySummaryListTable(3).bankReviewDateAction().click();

      cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: threeMonths.date });

      cy.clickContinueButton();

      applicationPreview.facilitySummaryListTable(3).bankReviewDateValue().contains(bankReviewDateFormatted);

      applicationPreview.submitButtonPostApproval();
    });

    it('cannot submit facility without facility end date', () => {
      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateAction().click();

      aboutFacilityUnissued.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.visit(relative(`/gef/application-details/${dealId}`));

      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateValue().contains('Yes');
      applicationPreview.facilitySummaryListTable(3).facilityEndDateValue().contains('Required');

      applicationPreview.submitButtonPostApproval().should('not.exist');
    });

    // checks that can edit changed facility
    it('clicking change should take you to about facility page with different url', () => {
      const issuedDate = threeDaysAgo.dMMMMyyyy;
      const coverStart = threeDaysAgo.dMMMMyyyy;

      // should be able to change number 1 as changed to issued
      applicationPreview.facilitySummaryListTable(3).nameValue().contains(unissuedCashFacility.name);
      applicationPreview.facilitySummaryListTable(3).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(3).coverStartDateValue().contains(coverStart);

      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateValue().contains('Yes');
      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateAction().contains('Change');

      applicationPreview.facilitySummaryListTable(3).nameAction().click();

      cy.url().should('eq', relative(`/gef/application-details/${dealId}/unissued-facilities/${facilityOneId}/change`));

      // checks that cancel does not save changes
      cy.keyboardInput(aboutFacilityUnissued.facilityName(), 'a new name');
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();

      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();

      cy.clickCancelLink();

      applicationPreview.facilitySummaryListTable(3).nameValue().contains(unissuedCashFacility.name);

      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateValue().contains('Yes');

      applicationPreview.facilitySummaryListTable(3).nameAction().contains('Change');
      applicationPreview.facilitySummaryListTable(3).nameAction().click();

      cy.keyboardInput(aboutFacilityUnissued.facilityName(), `${unissuedCashFacility.name}name`);
      aboutFacilityUnissued.shouldCoverStartOnSubmissionYes().click();

      aboutFacilityUnissued.isUsingFacilityEndDateNo().click();

      cy.clickContinueButton();

      cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: threeMonths.date });

      cy.clickContinueButton();

      // checks that name has been updated
      applicationPreview.facilitySummaryListTable(3).nameValue().contains(`${unissuedCashFacility.name}name`);
      applicationPreview.facilitySummaryListTable(3).issueDateValue().contains(issuedDate);

      applicationPreview.facilitySummaryListTable(3).isUsingFacilityEndDateValue().contains('No');
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
