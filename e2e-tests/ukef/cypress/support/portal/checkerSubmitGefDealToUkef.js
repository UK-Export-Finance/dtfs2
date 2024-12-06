import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';

const gefPages = require('../../../../gef/cypress/e2e/pages');

const { BANK1_CHECKER1 } = MOCK_USERS;

/**
 * Login as a checker and submit a gef deal to ukef
 * @param {Object} deal
 */
export const checkerSubmitGefDealToUkef = (deal) => {
  cy.login(BANK1_CHECKER1);
  gefPages.applicationDetails.visit(deal._id);
  cy.clickSubmitButton();
  gefPages.applicationSubmission.confirmSubmissionCheckbox().check();
  cy.clickSubmitButton();
};
