import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIN } from '../../../../fixtures/mock-gef-deals';

context('Deal cancellation button - feature flag disabled', () => {
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

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
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

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
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

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });
  });
});
