import { format } from 'date-fns';
import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_FACILITY_ONE } from '../../../../../fixtures/mock-gef-facilities';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import { todayDay, todayMonth, todayYear } from '../../../../../../../e2e-fixtures/dateConstants';
import { DATE_FORMATS } from '../../../../../fixtures/constants';

if (Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true') {
  context('Amendments - GEF deal add multiple consecutive amendments impacting facility end date values', () => {
    let dealId;
    let facility;

    const Date1 = new Date('2024-01-01');
    const Date2 = new Date('2024-02-02');
    const Date3 = new Date('2024-03-03');
    const Date4 = new Date('2024-04-04');
    const Date5 = new Date('2024-05-05');

    const currentDateFormat = DATE_FORMATS.FULL;
    const checkAnswersDateFormat = DATE_FORMATS.SHORT;
    const facilityPageDateFormat = DATE_FORMATS.SINGLE_DIGIT_DAY_LONG;

    const MOCK_GEF_FACILITY_WITH_BANK_REVIEW_DATE = {
      ...MOCK_FACILITY_ONE,
      hasBeenIssued: true,
      isUsingFacilityEndDate: false,
      facilityEndDate: undefined,
      bankReviewDate: Date1,
    };

    before(() => {
      // inserts a gef deal
      cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;
        // updates a gef deal so has relevant fields
        cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

        cy.createGefFacilities(dealId, [MOCK_GEF_FACILITY_WITH_BANK_REVIEW_DATE], BANK1_MAKER1).then((createdFacility) => {
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

    it('should display the current bank review date details from the facility snapshot in the Details tab', () => {
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
      facilityPage.facilityBankReviewDate().should('have.text', format(Date1, facilityPageDateFormat));
      facilityPage.facilityFacilityEndDate().should('not.exist');
    });

    describe('when amending the bank review date for the first time', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date1 });
        amendmentsPage.isUsingFacilityEndDateNo().click();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', format(Date1, currentDateFormat));
        amendmentsPage.amendmentBankReviewDateDetails().should('exist');

        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(format(Date2, 'd'));
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(format(Date2, 'M'));
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(format(Date2, 'yyyy'));
        amendmentsPage.continueAmendment().click();
      });

      it('should display the correct values on the check answers page and facility page', () => {
        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
        amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', format(Date2, checkAnswersDateFormat));
        amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

        amendmentsPage.continueAmendment().click();

        cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
        facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
        facilityPage.facilityBankReviewDate().should('have.text', format(Date2, facilityPageDateFormat));
        facilityPage.facilityFacilityEndDate().should('not.exist');
      });
    });

    describe('when amending the bank review date for a second time', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date2 });
        amendmentsPage.isUsingFacilityEndDateNo().click();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'bank-review-date');
        amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', format(Date2, currentDateFormat));
        amendmentsPage.amendmentBankReviewDateDetails().should('exist');

        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(format(Date3, 'd'));
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(format(Date3, 'M'));
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(format(Date3, 'yyyy'));
        amendmentsPage.continueAmendment().click();
      });

      it('should display the correct values on the check answers page and facility page', () => {
        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
        amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', format(Date3, checkAnswersDateFormat));
        amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

        amendmentsPage.continueAmendment().click();

        cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
        facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
        facilityPage.facilityBankReviewDate().should('have.text', format(Date3, facilityPageDateFormat));
        facilityPage.facilityFacilityEndDate().should('not.exist');
      });
    });

    describe('when amending the facility end date for the first time', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date3 });
        amendmentsPage.isUsingFacilityEndDateYes().click();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'facility-end-date');
        amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', 'Not provided');
        amendmentsPage.amendmentFacilityEndDateDetails().should('exist');

        amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(format(Date4, 'd'));
        amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(format(Date4, 'M'));
        amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(format(Date4, 'yyyy'));
        amendmentsPage.continueAmendment().click();
      });

      it('should display the correct values on the check answers page and facility page', () => {
        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
        amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', format(Date4, checkAnswersDateFormat));
        amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

        amendmentsPage.continueAmendment().click();

        cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
        facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
        facilityPage.facilityFacilityEndDate().should('have.text', format(Date4, facilityPageDateFormat));
        facilityPage.facilityBankReviewDate().should('not.exist');
      });
    });

    describe('when amending the facility end date for a second time', () => {
      beforeEach(() => {
        amendmentsPage.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true, newCoverEndDate: Date4 });

        amendmentsPage.isUsingFacilityEndDateNo().click();
        amendmentsPage.continueAmendment().click();

        // There should no longer be a current bank review date value, as the last amendment had a facility end date.
        // We reset it to bank review date here.
        amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', 'Not provided');
        amendmentsPage.amendmentBankReviewDateDayInput().clear().type(format(Date5, 'd'));
        amendmentsPage.amendmentBankReviewDateMonthInput().clear().type(format(Date5, 'M'));
        amendmentsPage.amendmentBankReviewDateYearInput().clear().type(format(Date5, 'yyyy'));
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDateChangeLink().click();

        amendmentsPage.isUsingFacilityEndDateYes().click();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'facility-end-date');
        amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', format(Date4, DATE_FORMATS.FULL));
        amendmentsPage.amendmentFacilityEndDateDetails().should('exist');

        amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(format(Date5, 'd'));
        amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(format(Date5, 'M'));
        amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(format(Date5, 'yyyy'));
        amendmentsPage.continueAmendment().click();
      });

      it('should display the correct values on the check answers page and facility page', () => {
        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
        amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', format(Date5, checkAnswersDateFormat));
        amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

        amendmentsPage.continueAmendment().click();

        cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
        facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
        facilityPage.facilityFacilityEndDate().should('have.text', format(Date5, facilityPageDateFormat));
        facilityPage.facilityBankReviewDate().should('not.exist');
      });
    });

    describe('after submitting further amendments that do not change the facility end date or bank review date values', () => {
      beforeEach(() => {
        facilityPage.facilityTabAmendments().click();
        amendmentsPage.addAmendmentButton().click();

        cy.url().should('contain', 'request-date');
        amendmentsPage.amendmentRequestDayInput().clear().type(todayDay);
        amendmentsPage.amendmentRequestMonthInput().clear().type(todayMonth);
        amendmentsPage.amendmentRequestYearInput().clear().type(todayYear);
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'request-approval');
        amendmentsPage.amendmentRequestApprovalNo().check();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'amendment-effective-date');
        amendmentsPage.amendmentEffectiveDayInput().clear().type(todayDay);
        amendmentsPage.amendmentEffectiveMonthInput().clear().type(todayMonth);
        amendmentsPage.amendmentEffectiveYearInput().clear().type(todayYear);
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'amendment-options');
        amendmentsPage.amendmentFacilityValueCheckbox().check();
        amendmentsPage.continueAmendment().click();

        cy.url().should('contain', 'facility-value');
        amendmentsPage.amendmentFacilityValueInput().clear().focused().type('123');
        amendmentsPage.continueAmendment().click();
      });

      it('should continue to display the correct (most recent) amended facility end date details', () => {
        cy.url().should('contain', 'check-answers');
        amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
        amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');
        amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

        amendmentsPage.continueAmendment().click();

        cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
        facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
        facilityPage.facilityFacilityEndDate().should('have.text', format(Date5, facilityPageDateFormat));
        facilityPage.facilityBankReviewDate().should('not.exist');
      });
    });
  });
}
