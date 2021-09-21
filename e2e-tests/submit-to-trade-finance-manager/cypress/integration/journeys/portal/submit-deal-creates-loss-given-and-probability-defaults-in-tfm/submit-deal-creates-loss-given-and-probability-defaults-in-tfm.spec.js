import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/integration/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/integration/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/mockUsers';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';

const MAKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));
const CHECKER_LOGIN = MOCK_USERS.find((user) => (user.roles.includes('checker') && user.username === 'BANK1_CHECKER1'));

context('Portal to TFM deal submission', () => {
  let deal;
  let dealId;

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

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN);
      });
  });

  it('Portal deal is submitted to UKEF - deal `loss given default` defaults to `50%`, `probability of default` defaults to `Less than 14.1%`', () => {
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
    portalPages.contractConfirmSubmission.acceptAndSubmit().click(deal);

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');


    //---------------------------------------------------------------
    // user login to TFM
    //---------------------------------------------------------------
    // Cypress.config('tfmUrl') returns incorrect url...
    const tfmRootUrl = 'http://localhost:5003';

    cy.forceVisit(tfmRootUrl);

    tfmPages.landingPage.email().type('BUSINESS_SUPPORT_USER_1');
    tfmPages.landingPage.submitButton().click();

    const tfmCaseDealPage = `${tfmRootUrl}/case/${dealId}/deal`;
    cy.forceVisit(tfmCaseDealPage);

    tfmPartials.caseSubNavigation.underwritingLink().click();

    tfmPages.underwritingPricingAndRiskPage.exporterTableLossGivenDefault().should('exist');

    tfmPages.underwritingPricingAndRiskPage.exporterTableLossGivenDefault().invoke('text').then((text) => {
      expect(text.trim()).to.eq('50%');
    });

    tfmPages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault().should('exist');

    tfmPages.underwritingPricingAndRiskPage.exporterTableProbabilityOfDefault().invoke('text').then((text) => {
      expect(text.trim()).to.eq('Less than 14.1%');
    });

  });
});
