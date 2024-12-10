import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import portalPartials from '../../../../../../portal/cypress/e2e/partials';
import tfmPages from '../../../../../../tfm/cypress/e2e/pages';
import tfmPartials from '../../../../../../tfm/cypress/e2e/partials';

import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';
import { UNDERWRITER_MANAGER_1, TFM_URL } from '../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  before(() => {
    cy.insertManyDeals([MOCK_DEAL_READY_TO_SUBMIT()], BANK1_MAKER1)
      .then((insertedDeals) => {
        [deal] = insertedDeals;
        dealId = insertedDeals[0]._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1)
          .then((createdFacilities) => {
            dealFacilities.push(...createdFacilities);
          })
          .then(() => {
            cy.wrap(dealFacilities).should('not.be.empty');
          });
      })
      .then(() => {
        cy.wrap(deal).should('not.be.empty');
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

  it('Portal MIA deal is submitted to UKEF. TFM Underwriter manager submits `Refused` decision, Portal deal status is updated, comments/reason for refusal display', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(BANK1_MAKER1);
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

    const MOCK_COMMENTS = 'e2e refused comment';

    tfmPages.managersDecisionPage.decisionRadioInputDecline().click();
    cy.keyboardInput(tfmPages.managersDecisionPage.commentsInputDecline(), MOCK_COMMENTS);
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

    cy.assertText(portalPages.contract.status(), 'Rejected by UKEF');

    //---------------------------------------------------------------
    // Portal deal comments/conditions should be displayed
    //---------------------------------------------------------------
    portalPages.contract.commentsTab().click();

    cy.assertText(portalPartials.ukefComments.comments.title(), 'Reason for rejection:');

    cy.assertText(portalPartials.ukefComments.comments.text(), MOCK_COMMENTS);
  });
});
