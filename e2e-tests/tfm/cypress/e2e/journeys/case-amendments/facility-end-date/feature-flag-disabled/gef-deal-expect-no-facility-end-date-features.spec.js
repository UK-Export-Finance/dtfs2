import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { MOCK_FACILITY_ONE } from '../../../../../fixtures/mock-gef-facilities';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

if (Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'false') {
  context('Amendments - GEF deal does not display any Facility end date pages or fields when TFM feature flag is disabled', () => {
    let dealId;
    let facility;

    const MOCK_GEF_FACILITY = {
      ...MOCK_FACILITY_ONE,
      hasBeenIssued: true,
    };

    before(() => {
      // inserts a gef deal
      cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;
        // updates a gef deal so has relevant fields
        cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

        cy.createGefFacilities(dealId, [MOCK_GEF_FACILITY], BANK1_MAKER1).then((createdFacility) => {
          facility = createdFacility.details;
        });

        cy.submitDeal(dealId, DEAL_TYPE.GEF, T1_USER_1);
      });
    });

    beforeEach(() => {
      cy.login({ user: PIM_USER_1 });
      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    it('should not show any facility end date fields in the Details tab', () => {
      facilityPage.facilityIsUsingFacilityEndDate().should('not.exist');
      facilityPage.facilityFacilityEndDate().should('not.exist');
      facilityPage.facilityBankReviewDate().should('not.exist');
    });

    it('should go straight from the cover end date amendments page to the review amendment answers page without displaying any facility end date fields', () => {
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

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');
    });
  });
}
