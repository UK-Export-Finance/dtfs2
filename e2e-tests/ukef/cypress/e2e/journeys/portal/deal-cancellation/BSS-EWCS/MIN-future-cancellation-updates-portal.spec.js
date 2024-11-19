import { DEAL_STATUS } from '@ukef/dtfs2-common';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import generateMinReadyToSubmit from '../../test-data/MIN-deal/dealReadyToSubmit';
import { TFM_URL, PIM_USER_1 } from '../../../../../../../e2e-fixtures';
import { tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

describe('Deal Cancellation status updates', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(generateMinReadyToSubmit(), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
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

  describe('effective date in the future', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      portalPages.contract.visit(deal);
      portalPages.contract.proceedToReview().click();

      cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
      portalPages.contractReadyForReview.readyForCheckersApproval().click();

      cy.login(BANK1_CHECKER1);
      portalPages.contract.visit(deal);

      cy.assertText(portalPages.contract.status(), "Ready for Checker's approval");

      portalPages.contract.proceedToSubmit().click();

      portalPages.contractConfirmSubmission.confirmSubmit().check();
      portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

      cy.clearCookie('dtfs-session');
      cy.clearCookie('_csrf');
      cy.getCookies().should('be.empty');
      cy.forceVisit(TFM_URL);
      cy.tfmLogin(PIM_USER_1);

      cy.submitDealCancellation({ dealId, effectiveDate: tomorrow.date });
    });

    it(`displays deal status ${DEAL_STATUS.PENDING_CANCELLATION} on deal summary page`, () => {
      portalPages.contract.visit(deal);

      cy.assertText(portalPages.contract.status(), DEAL_STATUS.PENDING_CANCELLATION);

      portalPages.contract.checkDealDetailsTab().click();

      cy.assertText(portalPages.contract.status(), DEAL_STATUS.PENDING_CANCELLATION);
    });
  });
});
