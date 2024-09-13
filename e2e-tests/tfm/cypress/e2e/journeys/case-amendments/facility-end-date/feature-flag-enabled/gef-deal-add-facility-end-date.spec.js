import relative from '../../../../relativeURL';
import { errorSummary } from '../../../../partials';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_FACILITY_ONE } from '../../../../../fixtures/mock-gef-facilities';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import dateConstants from '../../../../../../../e2e-fixtures/dateConstants';

if (Cypress.env('FF_TFM_FACILITY_END_DATE_ENABLED') === 'true') {
  context('Amendments - GEF deal add facility end date', () => {
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
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    it('should display the default blank facility end date fields in the Details tab', () => {
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', '-');
      facilityPage.facilityFacilityEndDate().should('have.text', '-');
      facilityPage.facilityBankReviewDate().should('not.exist');
    });

    it('should navigate to the facility end date page after selecting "Yes" to "Has the bank provided a facility end date"', () => {
      cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true });
      amendmentsPage.isUsingFacilityEndDateYes().should('not.be.checked');
      amendmentsPage.isUsingFacilityEndDateNo().should('not.be.checked');

      cy.clickContinueButton();
      errorSummary().contains('Select if the bank has provided an end date for this facility');

      amendmentsPage.isUsingFacilityEndDateYes().click();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', 'Not provided');
      amendmentsPage.amendmentFacilityEndDateDetails().should('exist');
    });

    it('should return expected errors when entering an incorrect facility end date', () => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.sixYearsOneDayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.sixYearsOneDayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.sixYearsOneDayYear);

      cy.clickContinueButton();
      errorSummary().contains('Facility end date cannot be greater than 6 years in the future');
    });

    it('should continue to the facility value page if the facility end date is valid and the facility value also needs changing', () => {
      cy.navigateToIsUsingFacilityEndDatePage({ changeFacilityValue: true });
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-value');
    });

    it('should continue to `Check your answers` page if the facility end date is valid and only the cover end date is being changed', () => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.todayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.todayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', dateConstants.todayFullString);
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');
    });

    it('should allow facility end date amendments on the `Check your answers` page', () => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerFacilityEndDateChangeLink().click();

      cy.url().should('contain', 'facility-end-date');
      amendmentsPage.amendmentFacilityEndDateDayInput().clear().type(dateConstants.threeMonthsOneDayDay);
      amendmentsPage.amendmentFacilityEndDateMonthInput().clear().type(dateConstants.threeMonthsOneDayMonth);
      amendmentsPage.amendmentFacilityEndDateYearInput().clear().type(dateConstants.threeMonthsOneDayYear);
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
      amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', dateConstants.threeMonthsOneDayFullString);
      amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

      amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().click();
    });

    it('should correctly display amended values on the facility summary page', () => {
      cy.navigateToIsUsingFacilityEndDatePage();
      cy.clickContinueButton();

      cy.url().should('contain', 'facility-end-date');
      cy.clickContinueButton();

      cy.url().should('contain', 'check-answers');
      cy.clickContinueButton();

      cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
      facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'Yes');
      facilityPage.facilityFacilityEndDate().should('have.text', dateConstants.threeMonthsOneDayFullMonthString);
      facilityPage.facilityBankReviewDate().should('not.exist');
    });
  });
}
