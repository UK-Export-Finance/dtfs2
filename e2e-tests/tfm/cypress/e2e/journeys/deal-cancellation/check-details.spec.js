import { format } from 'date-fns';
import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import { backLink } from '../../partials';
import { today, tomorrow, threeMonthsOneDay } from '../../../../../e2e-fixtures/dateConstants';
import checkDetailsPage from '../../pages/deal-cancellation/check-details';
import reasonForCancellingPage from '../../pages/deal-cancellation/reason-for-cancelling';

context('Deal cancellation - check details', () => {
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

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));

      cy.keyboardInput({ completeDateFormFields: 'bank-request-date' });

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));

      cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: tomorrow });

      cy.clickContinueButton();
    });

    it('should render page correctly', () => {
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));

      backLink();
      checkDetailsPage.reasonResponse();
      cy.assertText(checkDetailsPage.reasonResponse(), '-');

      checkDetailsPage.reasonLink();

      checkDetailsPage.bankRequestDateResponse();
      cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(today, 'd MMMM yyyy'));

      checkDetailsPage.bankRequestDateLink();

      checkDetailsPage.effectiveFromResponse();
      cy.assertText(checkDetailsPage.effectiveFromResponse(), format(tomorrow, 'd MMMM yyyy'));

      checkDetailsPage.effectiveFromLink();

      checkDetailsPage.dealDeletionButton();
      checkDetailsPage.returnLink();
    });

    it('back link should take you to the effective from date page', () => {
      cy.clickBackLink();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));
    });

    it('delete deal button should take you to the deal summary page', () => {
      checkDetailsPage.dealDeletionButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('return to deal summary link should take you to confirm cancellation page', () => {
      checkDetailsPage.returnLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/cancel`));
    });

    it('reason change link should take you to the reason for cancelling page and correctly update the reason', () => {
      const testReason = 'test reason';

      checkDetailsPage.reasonLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));

      cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), testReason);

      cy.clickContinueButton();
      cy.clickContinueButton();
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      cy.assertText(checkDetailsPage.reasonResponse(), testReason);
      cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(today, 'd MMMM yyyy'));
      cy.assertText(checkDetailsPage.effectiveFromResponse(), format(tomorrow, 'd MMMM yyyy'));
    });

    it('bank request date change link should take you to the bank request date page and correctly update any changes', () => {
      const testReason = 'test reason';
      checkDetailsPage.bankRequestDateLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));

      cy.keyboardInput({ completeDateFormFields: 'bank-request-date', date: threeMonthsOneDay });

      cy.clickContinueButton();
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      cy.assertText(checkDetailsPage.reasonResponse(), testReason);
      cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(threeMonthsOneDay, 'd MMMM yyyy'));
      cy.assertText(checkDetailsPage.effectiveFromResponse(), format(tomorrow, 'd MMMM yyyy'));
    });

    it('effective from date change link should take you to the effective from page and correctly update any changes', () => {
      const testReason = 'test reason';
      checkDetailsPage.effectiveFromLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));

      cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: threeMonthsOneDay });

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      cy.assertText(checkDetailsPage.reasonResponse(), testReason);
      cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(today, 'd MMMM yyyy'));
      cy.assertText(checkDetailsPage.effectiveFromResponse(), format(threeMonthsOneDay, 'd MMMM yyyy'));
    });
  });

  describe('when logged in as a non-PIM user', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
    });

    it('should redirect when visiting check details page', () => {
      cy.url().should('eq', relative('/deals/0'));
    });
  });
});
