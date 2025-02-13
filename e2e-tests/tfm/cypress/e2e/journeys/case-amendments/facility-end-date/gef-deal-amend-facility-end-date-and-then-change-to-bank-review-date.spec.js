import relative from '../../../relativeURL';
import facilityPage from '../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN } from '../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../pages/amendments/amendmentsPage';
import { threeMonthsOneDay, today } from '../../../../../../e2e-fixtures/dateConstants';

import { anIssuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';

context('Amendments - GEF deal amend facility end date and then change to bank review date', () => {
  let dealId;
  let facility;

  const facilityWithFacilityEndDate = {
    ...anIssuedCashFacility(),
    isUsingFacilityEndDate: true,
    facilityEndDate: new Date('2023-01-01'),
    bankReviewDate: undefined,
  };

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [facilityWithFacilityEndDate], BANK1_MAKER1).then((createdFacility) => {
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
    cy.navigateToIsUsingFacilityEndDatePage({ startNewAmendment: true });
    amendmentsPage.isUsingFacilityEndDateYes().should('not.be.checked');
    amendmentsPage.isUsingFacilityEndDateNo().should('not.be.checked');

    amendmentsPage.isUsingFacilityEndDateYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'facility-end-date');
    amendmentsPage.amendmentCurrentFacilityEndDate().should('have.text', '01 January 2023');
    amendmentsPage.amendmentFacilityEndDateDetails().should('exist');

    cy.completeDateFormFields({ idPrefix: 'amendment--facility-end-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'Yes');
    amendmentsPage.amendmentAnswerFacilityEndDate().should('have.text', today.dd_MMM_yyyy);
    amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');

    amendmentsPage.amendmentAnswerIsUsingFacilityEndDateChangeLink().click();
    amendmentsPage.isUsingFacilityEndDateNo().check();
    cy.clickContinueButton();

    cy.url().should('contain', 'bank-review-date');
    amendmentsPage.amendmentCurrentBankReviewDate().should('have.text', 'Not provided');
    amendmentsPage.amendmentBankReviewDateDetails().should('exist');

    cy.completeDateFormFields({ idPrefix: 'amendment--bank-review-date', date: threeMonthsOneDay.date });

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('have.text', 'No');
    amendmentsPage.amendmentAnswerBankReviewDate().should('have.text', threeMonthsOneDay.dd_MMM_yyyy);
    amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');

    cy.clickContinueButton();

    cy.visit(relative(`/case/${dealId}/facility/${facility._id}`));
    facilityPage.facilityIsUsingFacilityEndDate().should('have.text', 'No');
    facilityPage.facilityBankReviewDate().should('have.text', threeMonthsOneDay.d_MMMM_yyyy);
    facilityPage.facilityFacilityEndDate().should('not.exist');
  });
});
