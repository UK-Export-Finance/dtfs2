import relative from '../../e2e/relativeURL';
import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';

const gefPages = require('../../../../gef/cypress/e2e/pages');

const { BANK1_MAKER1 } = MOCK_USERS;

/**
 * Login as a maker and submit a gef deal for review
 * @param {object} deal
 */
export const makerLoginSubmitGefDealForReview = (deal) => {
  cy.login(BANK1_MAKER1);
  cy.visit(relative(`/gef/application-details/${deal._id}`));
  cy.clickSubmitButton();
  cy.url().should('eq', relative(`/gef/application-details/${deal._id}/submit`));
  cy.keyboardInput(gefPages.applicationSubmission.commentsField(), 'go');
  cy.clickSubmitButton();
};
