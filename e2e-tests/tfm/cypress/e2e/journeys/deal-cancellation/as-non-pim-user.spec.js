import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import { yesterday } from '../../../../../e2e-fixtures/dateConstants';

context('Deal cancellation - logged in as non-PIM user', () => {
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

  describe('when logged in as a non-PIM user', () => {
    before(() => {
      cy.login(PIM_USER_1);

      cy.visit(relative(`/case/${dealId}/deal`));

      caseDealPage.cancelDealButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));

      cy.completeDateFormFields({ idPrefix: 'bank-request-date' });

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));

      cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: yesterday.date });

      cy.clickContinueButton();
    });

    beforeEach(() => {
      cy.login(T1_USER_1);
    });

    it('should redirect when visiting the reason for cancelling page', () => {
      cy.visit(`/case/${dealId}/cancellation/reason`);

      cy.url().should('eq', relative('/deals/0'));
    });

    it('should redirect when visiting the bank request date page', () => {
      cy.visit(`/case/${dealId}/cancellation/bank-request-date`);

      cy.url().should('eq', relative('/deals/0'));
    });

    it('should redirect when visiting the effective from date page', () => {
      cy.visit(`/case/${dealId}/cancellation/effective-from-date`);

      cy.url().should('eq', relative('/deals/0'));
    });

    it('should redirect when visiting the check details page', () => {
      cy.visit(`/case/${dealId}/cancellation/check-details`);

      cy.url().should('eq', relative('/deals/0'));
    });

    it('should redirect when visiting the cancel cancellation page', () => {
      cy.visit(`/case/${dealId}/cancellation/cancel`);

      cy.url().should('eq', relative('/deals/0'));
    });
  });
});
