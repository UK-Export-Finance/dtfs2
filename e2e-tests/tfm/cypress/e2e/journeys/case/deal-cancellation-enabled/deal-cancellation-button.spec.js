import relative from '../../../relativeURL';
import pages from '../../../pages';
import MOCK_DEAL_AIN from '../../../../fixtures/deal-AIN';
import MOCK_DEAL_MIA from '../../../../fixtures/deal-MIA';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN, MOCK_APPLICATION_MIA, MOCK_APPLICATION_MIN } from '../../../../fixtures/mock-gef-deals';

context('Cancel deal button', () => {
  describe('when visiting a BSS/EWCS AIN deal summary page', () => {
    let ainDealId;
    before(() => {
      cy.insertOneDeal(MOCK_DEAL_AIN, BANK1_MAKER1).then((insertedDeal) => {
        ainDealId = insertedDeal._id;

        const { dealType } = MOCK_DEAL_AIN;

        cy.submitDeal(ainDealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(ainDealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${ainDealId}/deal`));
      });

      it('should display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${ainDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });
  });

  describe('when visiting a BSS/EWCS MIA deal summary page', () => {
    let miaDealId;
    before(() => {
      cy.insertOneDeal(MOCK_DEAL_MIA, BANK1_MAKER1).then((insertedDeal) => {
        miaDealId = insertedDeal._id;

        const { dealType } = MOCK_DEAL_MIA;

        cy.submitDeal(miaDealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(miaDealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${miaDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${miaDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });
  });

  describe('when visiting a GEF AIN deal summary page', () => {
    let ainDealId;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_AIN, BANK1_MAKER1).then((insertedDeal) => {
        ainDealId = insertedDeal._id;

        cy.updateGefDeal(ainDealId, MOCK_APPLICATION_AIN, BANK1_MAKER1);

        const { dealType } = MOCK_APPLICATION_AIN;

        cy.submitDeal(ainDealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(ainDealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${ainDealId}/deal`));
      });

      it('should display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${ainDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });
  });

  describe('when visiting a GEF MIN deal summary page', () => {
    let minDealId;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_MIN, BANK1_MAKER1).then((insertedDeal) => {
        minDealId = insertedDeal._id;

        cy.updateGefDeal(minDealId, MOCK_APPLICATION_MIN, BANK1_MAKER1);

        const { dealType } = MOCK_APPLICATION_MIN;

        cy.submitDeal(minDealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(minDealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${minDealId}/deal`));
      });

      it('should display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${minDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });
  });

  describe('when visiting a GEF MIA deal summary page', () => {
    let miaDealId;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_MIA, BANK1_MAKER1).then((insertedDeal) => {
        miaDealId = insertedDeal._id;

        cy.updateGefDeal(miaDealId, MOCK_APPLICATION_MIA, BANK1_MAKER1);

        const { dealType } = MOCK_APPLICATION_MIA;

        cy.submitDeal(miaDealId, dealType, T1_USER_1);
      });
    });

    after(() => {
      cy.deleteDeals(miaDealId, ADMIN);
    });

    describe('when logged in as a PIM user', () => {
      beforeEach(() => {
        cy.login(PIM_USER_1);
        cy.visit(relative(`/case/${miaDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });

    describe('when logged in as a non-PIM user', () => {
      beforeEach(() => {
        cy.login(T1_USER_1);
        cy.visit(relative(`/case/${miaDealId}/deal`));
      });

      it('should not display the deal cancellation button', () => {
        pages.caseDealPage.cancelButton().should('not.exist');
      });
    });
  });
});
