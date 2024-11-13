import portalPages from '../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';
import { TFM_URL, PIM_USER_1 } from '../../../../../../e2e-fixtures';
import { yesterday } from '../../../../../../e2e-fixtures/dateConstants';
import { submitDealCancellation } from '../../../../support/trade-finance-manager-ui/submit-deal-cancellation';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

describe('Deal Cancellation', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  beforeEach(() => {
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_MAKER1);
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  describe('effective date in the past', () => {
    before(() => {
      //---------------------------------------------------------------
      // portal maker submits deal for review
      //---------------------------------------------------------------
      cy.login(BANK1_MAKER1);
      portalPages.contract.visit(deal);
      portalPages.contract.proceedToReview().click();

      cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
      portalPages.contractReadyForReview.readyForCheckersApproval().click();

      //---------------------------------------------------------------
      // portal checker submits deal to ukef
      //---------------------------------------------------------------
      cy.login(BANK1_CHECKER1);
      portalPages.contract.visit(deal);
      portalPages.contract.proceedToSubmit().click();

      portalPages.contractConfirmSubmission.confirmSubmit().check();
      portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

      //---------------------------------------------------------------
      // user login to TFM
      //---------------------------------------------------------------
      cy.clearCookie('dtfs-session');
      cy.clearCookie('_csrf');
      cy.getCookies().should('be.empty');
      cy.forceVisit(TFM_URL);
      cy.tfmLogin(PIM_USER_1);

      submitDealCancellation({ dealId, effectiveDate: yesterday.date });
    });

    it('displays deal status `Cancelled` on deal summary page', () => {
      portalPages.contract.visit(deal);

      cy.assertText(portalPages.contract.status(), 'Cancelled');

      portalPages.contract.checkDealDetailsTab().click();

      cy.assertText(portalPages.contract.status(), 'Cancelled');
    });

    it('displays facility status `Risk expired` on deal summary page', () => {
      portalPages.contract.visit(deal);

      cy.assertText(portalPages.contract.bondTransactionsTable.row(dealFacilities[1]._id).bondStatus(), 'Risk expired');
      cy.assertText(portalPages.contract.loansTransactionsTable.row(dealFacilities[0]._id).loanStatus(), 'Risk expired');
    });
  });
});
