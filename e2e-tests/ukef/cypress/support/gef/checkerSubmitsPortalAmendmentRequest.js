import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';
import relative from '../../e2e/relativeURL';
import submitToUkef from '../../../../gef/cypress/e2e/pages/submit-to-ukef';

const { BANK1_CHECKER1 } = MOCK_USERS;

/**
 * Checker submits a portal amendment to UKEF
 * @param {string} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {string} param.submittedUrl - the URL to the approved by ukef page
 * @param {string} param.confirmSubmissionToUkefUrl - the URL to the confirm amendment submission page
 */
export const checkerSubmitsPortalAmendmentRequest = ({ amendmentDetailsUrl, submittedUrl, confirmSubmissionToUkefUrl }) => {
  cy.login(BANK1_CHECKER1);

  cy.visit(relative(amendmentDetailsUrl));
  cy.url().should('eq', relative(amendmentDetailsUrl));

  // Fail fast with a clear state mismatch message if the checker submit action points to an unexpected route.
  cy.get('[data-cy="submit-button"]').should('have.attr', 'href', confirmSubmissionToUkefUrl);

  cy.clickSubmitButton();
  cy.url().should('eq', relative(confirmSubmissionToUkefUrl));

  submitToUkef.confirmSubmissionCheckbox().click();
  cy.clickSubmitButton();

  cy.url().should('eq', relative(submittedUrl));
};
