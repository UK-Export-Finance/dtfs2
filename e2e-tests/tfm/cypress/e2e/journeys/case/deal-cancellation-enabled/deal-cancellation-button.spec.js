import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIA, MOCK_APPLICATION_MIN } from '../../../../fixtures/mock-gef-deals';
import reasonForCancellingPage from '../../../pages/deal-cancellation/reason-for-cancelling';

context('Deal cancellation button - feature flag enabled', () => {
  describe('when visiting a BSS/EWCS AIN deal summary page', () => {
    let dealId;
    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType } = MOCK_DEAL_AIN;

        cy.submitDeal(dealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should display button with text "Cancel deal" if there is no cancellation', () => {
        cy.assertText(pages.caseDealPage.cancelDealButton(), 'Cancel deal');
      });

      it('deal cancellation button should navigate to reason for cancelling page', () => {
        pages.caseDealPage.cancelDealButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
      });

      it('should display button with text "Continue with deal cancellation" if a cancellation is in draft', () => {
        pages.caseDealPage.cancelDealButton().click();
        cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), 'reason');

        cy.visit(relative(`/case/${dealId}/deal`));
        cy.assertText(pages.caseDealPage.cancelDealButton(), 'Continue with deal cancellation');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });
  });

  describe('when visiting a BSS/EWCS MIA deal summary page', () => {
    let dealId;
    before(() => {
      cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        const { dealType } = MOCK_DEAL_MIA;

        cy.submitDeal(dealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });
  });

  describe('when visiting a GEF AIN deal summary page', () => {
    let dealId;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

        const { dealType } = MOCK_APPLICATION_AIN;

        cy.submitDeal(dealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('exist');
      });

      it('deal cancellation button should navigate to reason for cancelling page', () => {
        pages.caseDealPage.cancelDealButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });
  });

  describe('when visiting a GEF MIN deal summary page', () => {
    let dealId;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_MIN, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        cy.updateGefDeal(dealId, MOCK_APPLICATION_MIN, BANK1_MAKER1);

        const { dealType } = MOCK_APPLICATION_MIN;

        cy.submitDeal(dealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('exist');
      });

      it('deal cancellation button should navigate to reason for cancelling page', () => {
        pages.caseDealPage.cancelDealButton().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });
  });

  describe('when visiting a GEF MIA deal summary page', () => {
    let dealId;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_MIA, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;

        cy.updateGefDeal(dealId, MOCK_APPLICATION_MIA, BANK1_MAKER1);

        const { dealType } = MOCK_APPLICATION_MIA;

        cy.submitDeal(dealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(dealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${dealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelDealButton().should('not.exist');
      });
    });
  });
});
