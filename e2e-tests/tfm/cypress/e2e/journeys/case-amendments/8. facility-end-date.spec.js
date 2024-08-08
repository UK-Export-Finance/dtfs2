import relative from '../../relativeURL';
import facilityPage from '../../pages/facilityPage';
import amendmentsPage from '../../pages/amendments/amendmentsPage';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, BANK1_MAKER1, ADMIN } from '../../../../../e2e-fixtures';

if (Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true') {
  context('Amendments - Facility End Date', () => {
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

    const navigateToFacilityEndDatePageGivenPrefilled = (amendFacilityValue = false) => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.continueAmendmentButton().click();
      cy.url().should('contain', 'request-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'request-approval');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-options');
      if (amendFacilityValue) {
        amendmentsPage.amendmentFacilityValueCheckbox().click();
      }
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'is-using-facility-end-date');
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-end-date');
    };

    it('should take you to `Enter the new facility end date', () => {
      cy.login(PIM_USER_1);
      const facilityId = dealFacilities[0]._id;

      cy.visit(relative(`/case/${dealId}/facility/${facilityId}`));

      facilityPage.facilityTabAmendments().click();
      amendmentsPage.addAmendmentButton().should('exist');
      amendmentsPage.addAmendmentButton().contains('Add an amendment request');
      amendmentsPage.addAmendmentButton().click();
      cy.url().should('contain', 'request-date');

      amendmentsPage.amendmentRequestDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentRequestMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentRequestYearInput().clear().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'request-approval');
      amendmentsPage.amendmentRequestApprovalYes().click();
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.amendmentCoverEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();
      cy.url().should('contain', 'is-using-facility-end-date');
      amendmentsPage.isUsingFacilityEndDateYes().click();
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-end-date');
    });

    it('should return errors when a date beyond six years in the future is entered', () => {
      navigateToFacilityEndDatePageGivenPrefilled();

      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.sixYearsOneDayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.sixYearsOneDayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.sixYearsOneDayYear);

      amendmentsPage.continueAmendment().click();
      amendmentsPage.errorSummary().contains('Facility end date cannot be greater than 6 years in the future');
    });

    it('should continue to `Check your answers` page if the facility end date is valid and only the cover end date is being changed', () => {
      navigateToFacilityEndDatePageGivenPrefilled();

      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'check-answers');

      amendmentsPage.amendmentAnswerBankRequestDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerRequireApproval().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerCoverEndDate().should('contain', dateConstants.todayDay);
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('contain', 'Yes');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('contain', dateConstants.todayDay);
    });

    it('should continue to the facility value page if the facility end date is valid and the facility value also needs changing', () => {
      navigateToFacilityEndDatePageGivenPrefilled(true);

      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-value');
    });
  });
}
