import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/integration/pages';
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

  it('Portal MIA deal is submitted to UKEF, tasks are added to the deal in TFM.', () => {
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

    const row = tfmPages.dealsPage.dealsTable.row(dealId);
    row.dealLink().click();
    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/deal`);

    tfmPartials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', `${tfmRootUrl}/case/${dealId}/tasks`);

    tfmPages.tasksPage.filterRadioAllTasks().click();

    const TOTAL_MIA_TASKS = 12;
    tfmPages.tasksPage.tasksTableRows().should('have.length', TOTAL_MIA_TASKS);
  });
});
