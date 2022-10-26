import relative from '../../../relativeURL';
import portalPages from '../../../../../../portal/cypress/e2e/pages';
import tfmPages from '../../../../../../trade-finance-manager/cypress/e2e/pages';
import tfmPartials from '../../../../../../trade-finance-manager/cypress/e2e/partials';

import MOCK_USERS from '../../../../../../portal/cypress/fixtures/users';
import MOCK_DEAL_READY_TO_SUBMIT from '../test-data/AIN-deal/dealReadyToSubmit';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;
import { BUSINESS_SUPPORT_USER_1, TFM_URL } from '../../../../../../e2e-fixtures';

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

  it('Portal AIN deal is submitted to UKEF, tasks are added to the deal in TFM.', () => {
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
    // user login to TFM
    //---------------------------------------------------------------
    cy.clearCookie('connect.sid');
    cy.clearCookie('_csrf');
    cy.getCookies().should('be.empty');

    cy.forceVisit(TFM_URL);

    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    const row = tfmPages.dealsPage.dealsTable.row(dealId);
    row.dealLink().click();
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/deal`);

    tfmPartials.caseSubNavigation.tasksLink().click();
    cy.url().should('eq', `${TFM_URL}/case/${dealId}/tasks`);

    tfmPages.tasksPage.filterRadioAllTasks().click();

    const TOTAL_AIN_TASKS = 2;
    tfmPages.tasksPage.tasksTableRows().should('have.length', TOTAL_AIN_TASKS);
  });
});
