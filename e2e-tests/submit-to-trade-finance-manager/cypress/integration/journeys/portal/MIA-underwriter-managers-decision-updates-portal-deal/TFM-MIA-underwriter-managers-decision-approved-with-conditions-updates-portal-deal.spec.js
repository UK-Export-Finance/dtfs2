import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import portalPartials from '../../../../../../portal/cypress/integration/partials';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';
import { BANK1_MAKER1, BANK1_CHECKER1 } from '../../../../../../portal/cypress/fixtures/users';
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
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
  });

  after(() => {
    cy.clearCookies();
    cy.clearCookie('connect.sid');
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

    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.forceVisit(TFM_URL);

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
    tfmPages.managersDecisionPage.submitButton().click();

    //---------------------------------------------------------------
    // Go back to Portal
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');
    cy.login(BANK1_CHECKER1);
    portalPages.contract.visit(deal);

    //---------------------------------------------------------------
    // Portal deal status should be updated
    //---------------------------------------------------------------
    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress by UKEF');
    });

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Accepted by UKEF (with conditions)');
    });

    //---------------------------------------------------------------
    // Portal deal comments/conditions should be displayed
    //---------------------------------------------------------------
    portalPages.contract.commentsTab().click();

    portalPartials.ukefComments.ukefDecision.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Special Conditions:');
    });

    portalPartials.ukefComments.ukefDecision.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_COMMENTS);
    });
  });
});
