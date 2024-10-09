import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import reasonForCancellingPage from '../../pages/deal-cancellation/reason-for-cancelling';
import { backLink } from '../../partials';
import cancelCancellationPage from '../../pages/deal-cancellation/cancel-cancellation';

context('Deal cancellation - cancel cancellation', () => {
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
    });

    describe('when a cancellation is in draft', () => {
      beforeEach(() => {
        cy.visit(relative(`/case/${dealId}/deal`));

        caseDealPage.cancelDealButton().click();

        cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox().clear(), 'xxx');
        cy.clickContinueButton();

        cy.clickCancelLink();
      });

      it('should render page correctly', () => {
        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));

        backLink();
        cancelCancellationPage.noGoBackButton();
        cancelCancellationPage.yesCancelButton();
      });
    });
  });

  describe('when logged in as a non-PIM user', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);

      cy.visit(relative(`/case/${dealId}/cancellation/cancel`));
    });

    it('should redirect when visiting reason for cancelling page ', () => {
      cy.url().should('eq', relative('/deals/0'));
    });
  });
});
