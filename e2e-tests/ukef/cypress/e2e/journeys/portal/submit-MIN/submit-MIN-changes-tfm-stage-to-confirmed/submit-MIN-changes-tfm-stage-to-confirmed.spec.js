import relative from '../../../../relativeURL';
import portalPages from '../../../../../../../portal/cypress/e2e/pages';

import tfmPartials from '../../../../../../../tfm/cypress/e2e/partials';

import CONSTANTS from '../../../../../../../tfm/cypress/fixtures/constants';

import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import MOCK_MIN_DEAL_READY_TO_SUBMIT from '../../test-data/MIN-deal/dealReadyToSubmit';

import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission - MIN changes TFM deal stage to Confirmed', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_MIN_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1).then((insertedDeals) => {
      [deal] = insertedDeals;
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

  it('Portal MIN deal is submitted to UKEF, TFM acknowledges the submission and updates the TFM deal stage to `Confirmed`', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    portalPages.contract.visit(deal);

    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    cy.keyboardInput(portalPages.contractReadyForReview.comments(), 'go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);

    cy.assertText(portalPages.contract.status(), CONSTANTS.DEAL_STATUS.READY_FOR_APPROVAL);

    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // TFM stage should be updated
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
    cy.forceVisit(tfmDealPage);

    tfmPartials.caseSummary.ukefDealStage().contains(CONSTANTS.DEAL_STAGE_TFM.CONFIRMED);
  });
});
