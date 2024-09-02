import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_FACILITY_ONE } from '../../../../../fixtures/mock-gef-facilities';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

if (Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true') {
  context('Amendments - GEF deal amend facility end date and then change to bank review date', () => {
    let dealId;
    let facility;

    const MOCK_GEF_FACILITY = {
      ...MOCK_FACILITY_ONE,
      hasBeenIssued: true,
      isUsingFacilityEndDate: true,
      facilityEndDate: new Date('2023-01-01'),
      bankReviewDate: undefined,
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
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    it('should display the current facility end date details the Details tab', () => {
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
      facilityPage.facilityFacilityEndDate().should('have.text', '1 January 2023');
      facilityPage.facilityBankReviewDate().should('not.exist');
    });

    it('should amend the facility correctly when first adding a facility end date and then switching to a bank review date during the amendment', () => {
      amendmentsPage.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true });
      amendmentsPage.isUsingFacilityEndDateYes().should('not.be.checked');
      amendmentsPage.isUsingFacilityEndDateNo().should('not.be.checked');

      amendmentsPage.isUsingFacilityEndDateYes().click();
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', '01 January 2023');
      amendmentsPage.amendmentFacilityEndDateDetails().should('exist');

      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.todayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', dateConstants.todayFullString);
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

      amendmentsPage.amendmentAnswerIsUsingFacilityEndDateChangeLink().click();
      amendmentsPage.isUsingFacilityEndDateNo().check();
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'bank-review-date');
      amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', 'Not provided');
      amendmentsPage.amendmentBankReviewDateDetails().should('exist');

      amendmentsPage.amendmentBankReviewDateDayInput().clear().type(dateConstants.threeMonthsOneDayDay);
      amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(dateConstants.threeMonthsOneDayMonth);
      amendmentsPage.amendmentBankReviewDateYearInput().clear().type(dateConstants.threeMonthsOneDayYear);
      amendmentsPage.continueAmendment().click();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
      amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', dateConstants.threeMonthsOneDayFullString);
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

      amendmentsPage.continueAmendment().click();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
      facilityPage.facilityBankReviewDate().should('have.text', dateConstants.threeMonthsOneDayFullMonthString);
      facilityPage.facilityFacilityEndDate().should('not.exist');
    });
  });
}
