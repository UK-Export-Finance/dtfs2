const relative = require('../../e2e/relativeURL');
const gefPages = require('../../../../gef/cypress/e2e/pages');
const { PIM_USER_1, TFM_URL } = require('../../../../e2e-fixtures');
const MOCK_USERS = require('../../../../e2e-fixtures/portal-users.fixture');

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

module.exports = (dealId, effectiveDate) => {
  //---------------------------------------------------------------
  // portal maker submits gef deal for review
  //---------------------------------------------------------------
  cy.login(BANK1_MAKER1);
  gefPages.applicationDetails.visit(dealId);
  cy.clickSubmitButton();
  cy.url().should('eq', relative(`/gef/application-details/${dealId}/submit`));
  cy.keyboardInput(gefPages.applicationSubmission.commentsField(), 'go');
  cy.clickSubmitButton();

  //---------------------------------------------------------------
  // portal checker submits gef deal to ukef
  //---------------------------------------------------------------
  cy.login(BANK1_CHECKER1);
  gefPages.applicationDetails.visit(dealId);
  cy.clickSubmitButton();
  gefPages.applicationSubmission.confirmSubmissionCheckbox().check();
  cy.clickSubmitButton();

  // expect to land on the /submit-to-ukef page with a success message
  cy.url().should('include', '/submit-to-ukef');

  //---------------------------------------------------------------
  // user login to TFM and schedule a cancellation gef deal for tomorrow
  //----------------------------------------------------------------
  cy.clearCookie('dtfs-session');
  cy.clearCookie('_csrf');
  cy.getCookies().should('be.empty');
  cy.forceVisit(TFM_URL);

  cy.tfmLogin(PIM_USER_1);
  cy.forceVisit(`${TFM_URL}/case/${dealId}/deal`);
  cy.submitDealCancellation({ dealId, effectiveDate });
};
