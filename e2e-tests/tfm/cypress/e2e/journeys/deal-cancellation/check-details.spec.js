import { format } from 'date-fns';
import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import { backLink, errorSummary } from '../../partials';
import effectiveFromDatePage from '../../pages/deal-cancellation/effective-from-date';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';
import bankRequestDatePage from '../../pages/deal-cancellation/bank-request-date';
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
      cy.keyboardInput(bankRequestDatePage.bankRequestDateDay(), dateConstants.todayDay);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), dateConstants.todayYear);
      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));
      cy.keyboardInput(effectiveFromDatePage.effectiveFromDateDay(), dateConstants.tomorrowDay);
      cy.keyboardInput(effectiveFromDatePage.effectiveFromDateMonth(), dateConstants.tomorrowMonth);
      cy.keyboardInput(effectiveFromDatePage.effectiveFromDateYear(), dateConstants.tomorrowYear);
      cy.clickContinueButton();
    });

    it('should render page correctly', () => {
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));

      backLink();
      checkDetailsPage.reasonResponse();
      cy.assertText(checkDetailsPage.reasonResponse(), '-');

      checkDetailsPage.reasonLink();

      checkDetailsPage.bankRequestDateResponse();
      cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(dateConstants.today, 'd MMMM yyyy'));

      checkDetailsPage.bankRequestDateLink();

      checkDetailsPage.effectiveFromResponse();
      cy.assertText(checkDetailsPage.effectiveFromResponse(), format(dateConstants.tomorrow, 'd MMMM yyyy'));

      checkDetailsPage.effectiveFromLink();

      checkDetailsPage.dealDeletionButton();
      checkDetailsPage.returnLink();
    });

    it('back link should take you to the effective from date page and continue to take you back through and out of the deal cancellation flow', () => {
      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));

      cy.clickBackLink();
      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('delete deal button should take you to the deal summary page', () => {
      checkDetailsPage.dealDeletionButton().click();

      cy.url().should('eq', relative(`/case/${dealId}/deal`));
    });

    it('return to deal summary link should take you to confirm cancellation page', () => {
      checkDetailsPage.returnLink().click();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/cancel`));
    });

    describe('reason change link', () => {
      it('takes you to the reason for cancelling page and correctly updates the reason', () => {
        const testReason = 'test reason';

        checkDetailsPage.reasonLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason?status=change`));

        cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), testReason);

        cy.clickContinueButton();
        cy.clickContinueButton();
        cy.clickContinueButton();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        cy.assertText(checkDetailsPage.reasonResponse(), testReason);
        cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(dateConstants.today, 'd MMMM yyyy'));
        cy.assertText(checkDetailsPage.effectiveFromResponse(), format(dateConstants.tomorrow, 'd MMMM yyyy'));
      });

      it('takes you to the reason for cancelling page and pressing "Back" returns you to the summary page', () => {
        checkDetailsPage.reasonLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason?status=change`));

        cy.clickBackLink();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      });

      it('takes you to the reason for cancelling page and pressing "Back" returns you to the summary page after validation errors', () => {
        checkDetailsPage.reasonLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason?status=change`));

        cy.keyboardInput(reasonForCancellingPage.reasonForCancellingTextBox(), 'x'.repeat(1201));
        cy.clickContinueButton();
        errorSummary();

        cy.clickBackLink();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      });
    });

    describe('bank request date change link', () => {
      it('takes you to the bank request date page and correctly updates any changes', () => {
        const testReason = 'test reason';
        checkDetailsPage.bankRequestDateLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date?status=change`));

        cy.keyboardInput(bankRequestDatePage.bankRequestDateDay(), dateConstants.threeMonthsOneDayDay);
        cy.keyboardInput(bankRequestDatePage.bankRequestDateMonth(), dateConstants.threeMonthsOneDayMonth);
        cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), dateConstants.threeMonthsOneDayYear);

        cy.clickContinueButton();
        cy.clickContinueButton();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        cy.assertText(checkDetailsPage.reasonResponse(), testReason);
        cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy'));
        cy.assertText(checkDetailsPage.effectiveFromResponse(), format(dateConstants.tomorrow, 'd MMMM yyyy'));
      });

      it('takes you to the bank request date page and pressing "Back" returns you to the summary page', () => {
        checkDetailsPage.bankRequestDateLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date?status=change`));

        cy.clickBackLink();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      });

      it('takes you to the bank request date page and pressing "Back" returns you to the summary page after validation errors', () => {
        checkDetailsPage.bankRequestDateLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date?status=change`));

        cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), '1');
        cy.clickContinueButton();
        errorSummary();

        cy.clickBackLink();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      });
    });

    describe('effective from date change link', () => {
      it('takes you to the effective from page and correctly updates any changes', () => {
        const testReason = 'test reason';
        checkDetailsPage.effectiveFromLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date?status=change`));

        cy.keyboardInput(effectiveFromDatePage.effectiveFromDateDay(), dateConstants.threeMonthsOneDayDay);
        cy.keyboardInput(effectiveFromDatePage.effectiveFromDateMonth(), dateConstants.threeMonthsOneDayMonth);
        cy.keyboardInput(effectiveFromDatePage.effectiveFromDateYear(), dateConstants.threeMonthsOneDayYear);

        cy.clickContinueButton();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
        cy.assertText(checkDetailsPage.reasonResponse(), testReason);
        cy.assertText(checkDetailsPage.bankRequestDateResponse(), format(dateConstants.today, 'd MMMM yyyy'));
        cy.assertText(checkDetailsPage.effectiveFromResponse(), format(dateConstants.threeMonthsOneDay, 'd MMMM yyyy'));
      });

      it('takes you to the effective from page and pressing "Back" returns you to the summary page', () => {
        checkDetailsPage.effectiveFromLink().click();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date?status=change`));

        cy.clickBackLink();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      });

      it('takes you to the effective from page and pressing "Back" returns you to the summary page after validation errors', () => {
        checkDetailsPage.effectiveFromLink().click();
        cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date?status=change`));

        cy.keyboardInput(effectiveFromDatePage.effectiveFromDateYear(), '1');
        cy.clickContinueButton();
        errorSummary();

        cy.clickBackLink();

        cy.url().should('eq', relative(`/case/${dealId}/cancellation/check-details`));
      });
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
