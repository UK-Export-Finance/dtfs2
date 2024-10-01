import relative from '../../relativeURL';
import MOCK_DEAL_AIN from '../../../fixtures/deal-AIN';
import { ADMIN, BANK1_MAKER1, PIM_USER_1, T1_USER_1 } from '../../../../../e2e-fixtures';
import caseDealPage from '../../pages/caseDealPage';
import { backLink, cancelLink, continueButton, errorSummary } from '../../partials';
import bankRequestDatePage from '../../pages/deal-cancellation/bank-request-date';
import dateConstants from '../../../../../e2e-fixtures/dateConstants';

context('Deal cancellation - bank request date', () => {
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
    });

    it('should render page correctly', () => {
      cy.url().should('eq', relative(`/case/${dealId}/cancellation/bank-request-date`));

      cancelLink();
      continueButton();
      backLink();
      bankRequestDatePage.bankRequestDateDay();
      bankRequestDatePage.bankRequestDateMonth();
      bankRequestDatePage.bankRequestDateYear();
    });

    it('should validate submitting a date more than 12 months in the future', () => {
      cy.keyboardInput(bankRequestDatePage.bankRequestDateDay(), dateConstants.twelveMonthsOneDayDay);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateMonth(), dateConstants.twelveMonthsOneDayMonth);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), dateConstants.twelveMonthsOneDayYear);

      cy.clickContinueButton();
      errorSummary().contains('The bank request date cannot exceed 12 months in the future from the submission date');
    });

    it('should validate submitting a date more than 12 months in the past', () => {
      cy.keyboardInput(bankRequestDatePage.bankRequestDateDay(), dateConstants.twelveMonthsOneDayAgoDay);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateMonth(), dateConstants.twelveMonthsOneDayAgoMonth);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), dateConstants.twelveMonthsOneDayAgoYear);

      cy.clickContinueButton();
      errorSummary().contains('The bank request date cannot exceed 12 months in the past from the submission date');
    });

    it('back link should take you to the reason for cancelling page', () => {
      cy.clickBackLink();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/reason`));
    });

    it('continue button should take you to the effective from date page', () => {
      cy.keyboardInput(bankRequestDatePage.bankRequestDateDay(), dateConstants.todayDay);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), dateConstants.todayYear);

      cy.clickContinueButton();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/effective-from-date`));
    });

    // TODO: DTFS2-7359 - add this test once cancel link is implemented
    it.skip('cancel link should take you to confirm cancellation page', () => {
      cy.clickCancelLink();

      cy.url().should('eq', relative(`/case/${dealId}/cancellation/cancel`));
    });

    it('returning to the page should display saved data', () => {
      cy.keyboardInput(bankRequestDatePage.bankRequestDateDay(), dateConstants.todayDay);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateMonth(), dateConstants.todayMonth);
      cy.keyboardInput(bankRequestDatePage.bankRequestDateYear(), dateConstants.todayYear);

      cy.clickContinueButton();
      cy.clickBackLink();

      bankRequestDatePage.bankRequestDateDay()().should('have.value', dateConstants.todayDay);
      bankRequestDatePage.bankRequestDateMonth()().should('have.value', dateConstants.todayMonth);
      bankRequestDatePage.bankRequestDateYear()().should('have.value', dateConstants.todayYear);
    });
  });

  describe('when logged in as a non-PIM user', () => {
    beforeEach(() => {
      cy.login(T1_USER_1);
    });

    it('should redirect when visiting bank request date page ', () => {
      cy.url().should('eq', relative('/deals/0'));
    });
  });
});
