import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import { sixYearsOneDay, threeMonthsOneDay, today } from '../../../../../../../e2e-fixtures/dateConstants';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';

context('Amendments - GEF deal add bank review date - feature flag enabled', () => {
  let dealId;
  let facility;

  const issuedCashFacility = anIssuedCashFacility();

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      // updates a gef deal to have relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdFacility) => {
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

  it('should display the default blank facility end date fields in the Details tab', () => {
    facilityPage.facilityIsUsingFacilityEndDate().should('have.text', '-');
    facilityPage.facilityFacilityEndDate().should('have.text', '-');
    facilityPage.facilityBankReviewDate().should('not.exist');
  });

  describe('when "No" is selected in response to "Has the bank provided a facility end date"', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true });
      amendmentsPage.isUsingFacilityEndDateYes().should('not.be.checked');
      amendmentsPage.isUsingFacilityEndDateNo().should('not.be.checked');

      cy.clickContinueButton();
      errorSummary().contains('Select if the bank has provided an end date for this facility');

      amendmentsPage.isUsingFacilityEndDateNo().click();
      cy.clickContinueButton();
    });

    it('should navigate to the bank review date page', () => {
      cy.url().should('contain', 'bank-review-date');
      amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', 'Not provided');
      amendmentsPage.amendmentBankReviewDateDetails().should('exist');
    });
  });

  describe('when the user has entered an incorrect bank review date', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();
      cy.url().should('contain', 'bank-review-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--bank-review-date', date: sixYearsOneDay.date });

      cy.clickContinueButton();
    });

    it('should return expected errors when entering an incorrect bank review date', () => {
      errorSummary().contains('Bank review date cannot be greater than 6 years in the future');
    });
  });

  describe('when the bank review date is valid and the facility value needs changing', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage({ changeFacilityValue: true });
      cy.clickContinueButton();

      cy.url().should('contain', 'bank-review-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--bank-review-date' });

      cy.clickContinueButton();
    });

    it('should continue to the facility value page', () => {
      cy.url().should('contain', 'facility-value');
    });
  });

  describe('when the bank review date is valid and only the cover end date is being changed', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();

      cy.url().should('contain', 'bank-review-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--bank-review-date' });

      cy.clickContinueButton();
    });

    it('should continue to "Check your answers" page', () => {
      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
      amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', today.dd_MMM_yyyy);
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
    });
  });

  describe('when on the check your answers page', () => {
    beforeEach(() => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();

      cy.url().should('contain', 'bank-review-date');
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
    });

    it('should allow bank review date amendments on the `Check your answers` page', () => {
      amendmentsPage.amendmentAnswerBankReviewDateChangeLink().click();

      cy.url().should('contain', 'bank-review-date');

      cy.completeDateFormFields({ idPrefix: 'amendment--bank-review-date', date: threeMonthsOneDay.date });

      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
      amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', threeMonthsOneDay.dd_MMM_yyyy);
      amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
    });

    describe('when submitting and visiting the facility summary page', () => {
      beforeEach(() => {
        cy.clickContinueButton();
        cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      });

      it('should correctly display amended values', () => {
        facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
        facilityPage.facilityBankReviewDate().should('have.text', threeMonthsOneDay.d_MMMM_yyyy);
        facilityPage.facilityFacilityEndDate().should('not.exist');
      });
    });
  });
});
