import relative from '../../relativeURL';
import { errorSummary } from '../../partials';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

const tfmFacilityEndDateEnabled = Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true';

context('Amendments - Cover End Date', () => {
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      const { dealType, mockFacilities } = MOCK_DEAL_AIN;

      cy.createFacilities(dealId, [mockFacilities[0]], BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });

      cy.submitDeal(dealId, dealType, PIM_USER_1);
    });
  });

  after(() => {
    cy.deleteDeals(dealId, ADMIN);
    dealFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should take you to `Enter the new cover end date` page', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    amendmentsPage.addAmendmentButton().should('exist');
    amendmentsPage.addAmendmentButton().contains('Add an amendment request');
    amendmentsPage.addAmendmentButton().click();
    cy.url().should('contain', 'request-date');

    amendmentsPage.amendmentRequestDayInput().clear().focused().type(dateConstants.todayDay);
    amendmentsPage.amendmentRequestMonthInput().clear().focused().type(dateConstants.todayMonth);
    amendmentsPage.amendmentRequestYearInput().clear().focused().type(dateConstants.todayYear);
    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().should('not.be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');

    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    amendmentsPage.amendmentCoverEndDateCheckbox().should('be.checked');
    amendmentsPage.amendmentFacilityValueCheckbox().should('not.be.checked');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');
  });

  it('should NOT allow users to enter the same cover end date or with wrong year format', () => {
    cy.login(PIM_USER_1);
    const facilityId = dealFacilities[0]._id;
    cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

    facilityPage.facilityTabAmendments().click();
    cy.clickContinueButton();
    cy.url().should('contain', 'request-date');
    cy.clickContinueButton();
    cy.url().should('contain', 'request-approval');
    cy.clickContinueButton();
    cy.url().should('contain', 'amendment-options');
    cy.clickContinueButton();
    cy.url().should('contain', 'cover-end-date');
    amendmentsPage.amendmentCurrentCoverEndDate().should('contain', dateConstants.oneMonthFormattedFull);
    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.oneMonthDay);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.oneMonthMonth);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.oneMonthYear);
    cy.clickContinueButton();
    errorSummary().contains('The new cover end date cannot be the same as the current cover end date');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(20);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(10);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(22);
    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(20);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(10);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type('2O22');
    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(20);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(10);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type('20 22');
    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');

    amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(20);
    amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(10);
    amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type('2 22');
    cy.clickContinueButton();
    errorSummary().contains('The year for the amendment cover end date must include 4 numbers');
  });

  if (tfmFacilityEndDateEnabled) {
    it('should continue to the `Has the bank provided a facility end date` page if the cover end date is valid and the feature flag is enabled', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'request-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'request-approval');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'is-using-facility-end-date');
    });
  }

  if (!tfmFacilityEndDateEnabled) {
    it('should continue to the `Check answers` page if the cover end date is valid, only the cover end date is to be changed and the facility end date FF is disabled', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'request-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'request-approval');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
    });

    it('should continue to the `Enter the facility value` page if the cover end date is valid, the facility value also needs changing and the facility end date FF is disabled', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;
      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'request-date');
      cy.clickContinueButton();
      cy.url().should('contain', 'request-approval');
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentFacilityValueCheckbox().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.amendmentCoverEndDateDayInput().clear().focused().type(dateConstants.todayDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().focused().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().focused().type(dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-value');
    });
  }
});
