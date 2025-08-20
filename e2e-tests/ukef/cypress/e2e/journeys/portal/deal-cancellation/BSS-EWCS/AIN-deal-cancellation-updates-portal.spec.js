import { DEAL_STATUS, FACILITY_STAGE } from '@ukef/dtfs2-common';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import generateAinReadyToSubmit from '../../test-data/AIN-deal/dealReadyToSubmit';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';
import { yesterday } from '../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('BSS/EWCS AIN deal - When TFM submits a deal cancellation - Portal statuses should be updated', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertOneDeal(generateAinReadyToSubmit(), BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = deal;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.push(...createdFacilities);
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);
    cy.saveSession();
  });

  after(() => {
    cy.clearSessionCookies();
  });

  describe('effective date in the past', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      portalPages.contract.visit(deal);
      portalPages.contract.proceedToReview().click();

      cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
      portalPages.contractReadyForReview.readyForCheckersApproval().click();

      cy.login(BANK1_CHECKER1);
      portalPages.contract.visit(deal);
      portalPages.contract.proceedToSubmit().click();

      portalPages.contractConfirmSubmission.confirmSubmit().check();
      portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

      cy.clearCookie('dtfs-session');
      cy.clearCookie('_csrf');
      cy.getCookies().should('be.empty');

      cy.visit(TFM_URL);
      cy.tfmLogin(PIM_USER_1);

      cy.submitDealCancellation({ dealId, effectiveDate: yesterday.date });
    });

    it(`should render deal status ${DEAL_STATUS.CANCELLED} on deal summary page`, () => {
      portalPages.contract.visit(deal);

      cy.assertText(portalPages.contract.status(), DEAL_STATUS.CANCELLED);
    });

    it(`should render deal status ${DEAL_STATUS.CANCELLED} on check details tab`, () => {
      portalPages.contract.visit(deal);

      portalPages.contract.checkDealDetailsTab().click();

      cy.assertText(portalPages.contract.status(), DEAL_STATUS.CANCELLED);
    });

    it(`should render facility status ${FACILITY_STAGE.RISK_EXPIRED} on deal summary page`, () => {
      portalPages.contract.visit(deal);

      cy.assertText(portalPages.contract.bondTransactionsTable.row(dealFacilities[1]._id).facilityStage(), FACILITY_STAGE.RISK_EXPIRED);
      cy.assertText(portalPages.contract.loansTransactionsTable.row(dealFacilities[0]._id).facilityStage(), FACILITY_STAGE.RISK_EXPIRED);
    });
  });
});
