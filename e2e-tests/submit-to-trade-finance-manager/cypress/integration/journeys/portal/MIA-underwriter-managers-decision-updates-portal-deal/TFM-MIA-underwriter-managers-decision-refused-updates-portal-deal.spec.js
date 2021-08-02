import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import portalPartials from '../../../../../../portal/cypress/integration/partials';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/MIA-deal/dealReadyToSubmit';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;
  const dealFacilities = [];

  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertManyDeals([
      MOCK_DEAL_READY_TO_SUBMIT(),
    ], MAKER_LOGIN)
      .then((insertedDeals) => {
        deal = insertedDeals[0];
        dealId = insertedDeals[0]._id;

        const { mockFacilities } = deal;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          dealFacilities.push(...createdFacilities);
        });
      });
  });

  it('Portal MIA deal is submitted to UKEF. TFM Underwriter manager submits `Refused` decision, Portal deal status is updated, comments/reason for refusal display', () => {
    //---------------------------------------------------------------
    // portal maker submits deal for review
    //---------------------------------------------------------------
    cy.login(MAKER_LOGIN);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToReview().click();
    cy.url().should('eq', relative(`/contract/${dealId}/ready-for-review`));

    portalPages.contractReadyForReview.comments().type('go');
    portalPages.contractReadyForReview.readyForCheckersApproval().click();


    //---------------------------------------------------------------
    // portal checker submits deal to ukef
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    portalPages.contract.visit(deal);
    portalPages.contract.proceedToSubmit().click();

    portalPages.contractConfirmSubmission.confirmSubmit().check();
    portalPages.contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');

    //---------------------------------------------------------------
    // Underwriter Manager logs in to TFM
    //---------------------------------------------------------------
    // Cypress.config('tfmUrl') returns incorrect url...
    const tfmRootUrl = 'http://localhost:5003';

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('UNDERWRITER_MANAGER_1');
    tfmPages.landingPage.submitButton().click();

    const row = tfmPages.dealsPage.dealsTable.row(dealId);
    row.dealLink().click();
    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/deal`);

    //---------------------------------------------------------------
    // Underwriter Manager submits a decision
    //---------------------------------------------------------------
    tfmPartials.caseSubNavigation.underwritingLink().click();
    tfmPartials.underwritingSubNav.underwriterManagerDecisionLink().click();
    tfmPages.managersDecisionPage.addDecisionLink().click();

    const MOCK_COMMENTS = 'e2e refused comment';

    tfmPages.managersDecisionPage.decisionRadioInputDecline().click();
    tfmPages.managersDecisionPage.commentsInputDecline().type(MOCK_COMMENTS);
    tfmPages.managersDecisionPage.submitButton().click();


    //---------------------------------------------------------------
    // Go back to Portal
    //---------------------------------------------------------------
    cy.login(CHECKER_LOGIN);
    portalPages.contract.visit(deal);

    //---------------------------------------------------------------
    // Portal deal status should be updated
    //---------------------------------------------------------------
    portalPages.contract.previousStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('In progress by UKEF');
    });

    portalPages.contract.status().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Rejected by UKEF');
    });

    //---------------------------------------------------------------
    // Portal deal comments/conditions should be displayed
    //---------------------------------------------------------------
    portalPages.contract.commentsTab().click();

    portalPartials.ukefComments.comments.title().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Reason for rejection:');
    });

    portalPartials.ukefComments.comments.text().invoke('text').then((text) => {
      expect(text.trim()).to.equal(MOCK_COMMENTS);
    });
  });
});
