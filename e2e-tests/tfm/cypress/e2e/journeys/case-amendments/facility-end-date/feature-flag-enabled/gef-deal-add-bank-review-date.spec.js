import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_FACILITY_ONE } from '../../../../../fixtures/mock-gef-facilities';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

if (Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true') {
  context('Amendments - GEF deal add bank review date', () => {
    let dealId;
    let facility;

    const MOCK_GEF_FACILITY = {
      ...MOCK_FACILITY_ONE,
      hasBeenIssued: true,
      isUsingFacilityEndDate: undefined,
      facilityEndDate: undefined,
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
    });

    it('should display the default blank facility end date fields in the Details tab', () => {
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', '-');
      facilityPage.facilityFacilityEndDate().should('have.text', '-');
      facilityPage.facilityBankReviewDate().should('not.exist');
    });

    describe('when on the check your answers page', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'check-answers');
      });

      it('should allow bank review date amendments on the `Check your answers` page', () => {
        amendmentsPage.amendmentAnswerBankReviewDateChangeLink().click();

        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(dateConstants.threeMonthsOneDayDay);
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(dateConstants.threeMonthsOneDayMonth);
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(dateConstants.threeMonthsOneDayYear);
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
        amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', dateConstants.threeMonthsOneDayFullString);
        amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
      });

      describe('when submitting and visiting the facility summary page', () => {
        beforeEach(() => {
          amendmentsPage.continueAmendment().click();
          cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
        });

        it('should correctly display amended values', () => {
          facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
          facilityPage.facilityBankReviewDate().should('have.text', dateConstants.threeMonthsOneDayFullMonthString);
          facilityPage.facilityFacilityEndDate().should('not.exist');
        });
      });
    });

    describe('when "No" is selected in response to "Has the bank provided a facility end date"', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true });
        amendmentsPage.isUsingFacilityEndDateYes().should('not.be.checked');
        amendmentsPage.isUsingFacilityEndDateNo().should('not.be.checked');

        amendmentsPage.continueAmendment().click();
        amendmentsPage.errorSummary().contains('Select if the bank has provided an end date for this facility');

        amendmentsPage.isUsingFacilityEndDateNo().click();
        amendmentsPage.continueAmendment().click();
      });

      it('should navigate to the bank review date page', () => {
        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', 'Not provided');
        amendmentsPage.amendmentBankReviewDateDetails().should('exist');
      });
    });

    describe('when the user has entered an incorrect bank review date', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage();
        cy.url().should('contain', 'bank-review-date');

        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(dateConstants.sixYearsOneDayDay);
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(dateConstants.sixYearsOneDayMonth);
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(dateConstants.sixYearsOneDayYear);

        amendmentsPage.continueAmendment().click();
      });

      it('should return expected errors when entering an incorrect bank review date', () => {
        amendmentsPage.errorSummary().contains('Bank review date cannot be greater than 6 years in the future');
      });
    });

    describe('when the bank review date is valid and the facility value needs changing', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage({ changeFacilityValue: true });
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(dateConstants.todayDay);
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(dateConstants.todayMonth);
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(dateConstants.todayYear);
        amendmentsPage.continueAmendment().click();
      });

      it('should continue to the facility value page', () => {
        cy.url().should('contain', 'facility-value');
      });
    });

    describe('when the bank review date is valid and only the cover end date is being changed', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(dateConstants.todayDay);
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(dateConstants.todayMonth);
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(dateConstants.todayYear);
        amendmentsPage.continueAmendment().click();
      });

      it('should continue to "Check your answers" page', () => {
        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
        amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', dateConstants.todayFullString);
        amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
      });
    });
  });
}
