import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import portalPartials from '../../../../../../portal/cypress/e2e/partials';
import tfmPages from '../../../../../../tfm/cypress/e2e/pages';
import tfmPartials from '../../../../../../tfm/cypress/e2e/partials';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../../../e2e-fixtures/portal-users.fixture';
import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../../../e2e-fixtures';

import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';

context('Portal to TFM deal submission', () => {
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
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  it('Portal MIA deal is submitted to UKEF. TFM Underwriter manager submits `Accepted with conditions` decision, Portal deal status is updated, comments/conditions display', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();

    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // Underwriter Manager logs in to TFM
    //---------------------------------------------------------------

    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.tfmLogin(UNDERWRITER_MANAGER_1);

    const row = tfmPages.dealsPage.dealsTable.row(dealId);
    row.dealLink().click();
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // Underwriter Manager submits a decision
    //---------------------------------------------------------------
    tfmPartials.caseSubNavigation.underwritingLink().click();
    tfmPages.managersDecisionPage.addDecisionLink().click({ force: true });

    const MOCK_COMMENTS = 'e2e test comment';

    tfmPages.managersDecisionPage.decisionRadioInputApproveWithConditions().click();
    tfmPages.managersDecisionPage.commentsInputApproveWithConditions().type(MOCK_COMMENTS);
    cy.clickSubmitButton();

    //---------------------------------------------------------------
    // Go back to Portal
    //---------------------------------------------------------------
    cy.clearCookie('dtfs-session');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);

    //---------------------------------------------------------------
    // Portal deal status should be updated
    //---------------------------------------------------------------
    cy.assertText(portalPages.contract.previousStatus(), 'In progress by UKEF');

    cy.assertText(portalPages.contract.status(), 'Accepted by UKEF (with conditions)');

    //---------------------------------------------------------------
    // Portal deal comments/conditions should be displayed
    //---------------------------------------------------------------
    portalPages.contract.commentsTab().click();

    cy.assertText(portalPartials.ukefComments.ukefDecision.title(), 'Special Conditions:');

    cy.assertText(portalPartials.ukefComments.ukefDecision.text(), MOCK_COMMENTS);
  });
});
