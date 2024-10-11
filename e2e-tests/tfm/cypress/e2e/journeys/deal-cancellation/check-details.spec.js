import { format } from 'date-fns';
import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import { backLink, errorSummary } from '../../partials';
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

      cy.completeDateFormFields({ idPrefix: 'bank-request-date' });

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));

      cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: tomorrow });

      cy.clickContinueButton();
    });

    it('should render the page correctly', () => {
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

    it('back link takes you to the "effective from" page and continues to take you back through the deal cancellation flow', () => {
      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('delete deal button takes you to the deal summary page', () => {
      checkDetailsPage.dealDeletionButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('"return to deal summary" link takes you to confirm cancellation page', () => {
      checkDetailsPage.returnLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/cancel`));
    });

    describe('reason for cancelling deal - change link', () => {
      beforeEach(() => {
        checkDetailsPage.reasonLink().click();
      });

      it('redirects to the "reason for cancelling" page', () => {
        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason?status=change`));
      });

      it('correctly updates the "check details" page with the new reason', () => {
        const testReason = 'test reason';

        cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), testReason);

        cy.clickContinueButton();
        cy.clickContinueButton();
        cy.clickContinueButton();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        cy.assertText(checkDetailsPage.reasonResponse(), testReason);
        cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(today, 'd MMMM yyyy'));
        cy.assertText(checkDetailsPage.effectiveFromResponse(), format(tomorrow, 'd MMMM yyyy'));
      });

      describe('clicking the back link', () => {
        beforeEach(() => {
          cy.clickBackLink();
        });

        it('returns you to the "check details" page', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });

      describe('clicking the back link after validation errors', () => {
        beforeEach(() => {
          cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), 'x'.repeat(1201));
          cy.clickContinueButton();
          errorSummary();

          cy.clickBackLink();
        });

        it('returns you to the "check details" page', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });
    });

    describe('bank request date - change link', () => {
      beforeEach(() => {
        checkDetailsPage.bankRequestDateLink().click();
      });

      it('redirects to the "bank request date" page', () => {
        cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date?status=change`));
      });

      it('correctly updates the "check details" page with the new bank request date', () => {
        const testReason = 'test reason';

        cy.completeDateFormFields({ idPrefix: 'bank-request-date', date: threeMonthsOneDay });

        cy.clickContinueButton();
        cy.clickContinueButton();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        cy.assertText(checkDetailsPage.reasonResponse(), testReason);
        cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(threeMonthsOneDay, 'd MMMM yyyy'));
        cy.assertText(checkDetailsPage.effectiveFromResponse(), format(tomorrow, 'd MMMM yyyy'));
      });

      describe('clicking the back link', () => {
        beforeEach(() => {
          cy.clickBackLink();
        });

        it('returns you to the "check details" page', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });

      describe('clicking the back link after validation errors', () => {
        beforeEach(() => {
          cy.completeDateFormFields({ idPrefix: 'bank-request-date', day: null, month: null, year: '1' });
          cy.clickContinueButton();
          errorSummary();

          cy.clickBackLink();
        });

        it('returns you to the "check details" page', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });
    });

    describe('effective from - change link', () => {
      beforeEach(() => {
        checkDetailsPage.effectiveFromLink().click();
      });

      it('redirects to the "effective from" page', () => {
        cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date?status=change`));
      });

      it('correctly updates the "check details" page with the new effective from date', () => {
        const testReason = 'test reason';

        cy.completeDateFormFields({ idPrefix: 'effective-from-date', date: threeMonthsOneDay });

        cy.clickContinueButton();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        cy.assertText(checkDetailsPage.reasonResponse(), testReason);
        cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(today, 'd MMMM yyyy'));
        cy.assertText(checkDetailsPage.effectiveFromResponse(), format(threeMonthsOneDay, 'd MMMM yyyy'));
      });

      describe('clicking the back link', () => {
        beforeEach(() => {
          cy.clickBackLink();
        });

        it('returns you to the "check details" page', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });

      describe('clicking the back link after validation errors', () => {
        beforeEach(() => {
          cy.completeDateFormFields({ idPrefix: 'effective-from-date', day: null, month: null, year: '1' });
          cy.clickContinueButton();
          errorSummary();

          cy.clickBackLink();
        });

        it('returns you to the "check details" page', () => {
          cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        });
      });
    });
  });

  describe('when logged in as a non-PIM user', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
    });

    it('should redirect when visiting the check details page', () => {
      cy.url().should('eq', relative('/deals/0'));
    });
  });
});
