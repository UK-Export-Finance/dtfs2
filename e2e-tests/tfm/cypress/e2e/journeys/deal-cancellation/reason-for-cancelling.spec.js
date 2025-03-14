import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import reasonForCancellingPage from '../../pages/deal-cancellation/reason-for-cancelling';
import { backLink, cancelLink, continueButton, errorSummary } from '../../partials';

context('Deal cancellation - reason for cancelling', () => {
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

  describe('when logged in as a PIM user', () => {
    beforeEach(() => {
      cy.login(PIM_USER_1);
      cy.visit(relative(`/case/${dealId}/deal`));

      caseDealPage.cancelDealButton().click();
    });

    it('should render page correctly', () => {
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));

      cancelLink();
      continueButton();
      backLink();
      reasonForCancellingPage.reasonForCancellingTextBox();
    });

    it('should validate submitting more than 1,200 characters', () => {
      cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), 'x'.repeat(1201));

      cy.clickContinueButton();

      errorSummary().contains('Reason for cancelling must be 1,200 characters or less');
      reasonForCancellingPage.reasonForCancellingError().contains('Reason for cancelling must be 1,200 characters or less');
    });

    it('back link should take you to deal summary page', () => {
      cy.clickBackLink();

      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('continue button should take you to bank request date page', () => {
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));
    });

    it('cancel link should take you to confirm cancellation page', () => {
      cy.clickCancelLink();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/cancel`));
    });

    it('returning to the page should display saved data', () => {
      const reason = 'A Reason';
      cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), reason);

      cy.clickContinueButton();
      cy.clickBackLink();

      reasonForCancellingPage.reasonForCancellingTextBox().should('have.value', reason);
    });
  });
});
