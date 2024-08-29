import relative from '../../relativeURL';
import { errorSummary } from '../../partials';
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

    const navigateToIsUsingFacilityEndDatePageGivenPrefilled = () => {
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
      cy.clickContinueButton();
      cy.url().should('contain', 'is-using-facility-end-date');
    };

    it('should take you to `Has the bank provided a facility end date` page with initially unchecked values', () => {
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
      cy.clickContinueButton();

      cy.url().should('contain', 'request-approval');
      amendmentsPage.amendmentRequestApprovalYes().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'amendment-options');
      amendmentsPage.amendmentCoverEndDateCheckbox().click();
      cy.clickContinueButton();
      cy.url().should('contain', 'cover-end-date');
      amendmentsPage.amendmentCoverEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentCoverEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentCoverEndDateYearInput().clear().type(dateConstants.todayYear);
      cy.clickContinueButton();

      amendmentsPage.isUsingFacilityEndDateYes().should('be.not.checked');
      amendmentsPage.isUsingFacilityEndDateNo().should('be.not.checked');
    });

    it('should return errors when no options are selected', () => {
      navigateToIsUsingFacilityEndDatePageGivenPrefilled();

      amendmentsPage.isUsingFacilityEndDateYes().should('be.not.checked');
      amendmentsPage.isUsingFacilityEndDateNo().should('be.not.checked');

      cy.clickContinueButton();

      errorSummary().contains('Select if the bank has provided an end date for this facility');
    });

    it("should continue to `Enter the new facility end date` page if 'Yes' is selected", () => {
      navigateToIsUsingFacilityEndDatePageGivenPrefilled();

      amendmentsPage.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
    });

    it("should continue to `Enter the bank review date` page if 'No' is selected", () => {
      navigateToIsUsingFacilityEndDatePageGivenPrefilled();

      amendmentsPage.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'bank-review-date');
    });
  });
}
