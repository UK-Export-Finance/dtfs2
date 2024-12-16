import relative from '../../../../relativeURL';
import facilityPage from '../../../../pages/facilityPage';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN } from '../../../../../fixtures/mock-gef-deals';
import { DEAL_TYPE } from '../../../../../../../gef/cypress/fixtures/constants';
import amendmentsPage from '../../../../pages/amendments/amendmentsPage';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';

context('Amendments - GEF deal does not display any Facility end date pages or fields when TFM feature flag is disabled', () => {
  let dealId;
  let facility;

  before(() => {
    // inserts a gef deal
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anIssuedCashFacility()], BANK1_MAKER1).then((createdFacility) => {
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

    cy.completeDateFormFields({ idPrefix: 'amendment--request-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'request-approval');
    amendmentsPage.amendmentRequestApprovalYes().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'amendment-options');
    amendmentsPage.amendmentCoverEndDateCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('contain', 'cover-end-date');

    cy.completeDateFormFields({ idPrefix: 'amendment--cover-end-date' });

    cy.clickContinueButton();

    cy.url().should('contain', 'check-answers');
    amendmentsPage.amendmentAnswerIsUsingFacilityEndDate().should('not.exist');
    amendmentsPage.amendmentAnswerFacilityEndDate().should('not.exist');
    amendmentsPage.amendmentAnswerBankReviewDate().should('not.exist');
  });
});
