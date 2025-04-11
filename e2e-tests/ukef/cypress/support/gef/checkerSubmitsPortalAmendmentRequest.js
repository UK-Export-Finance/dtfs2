import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';
import relative from '../../e2e/relativeURL';
import submitToUkef from '../../../../gef/cypress/e2e/pages/submit-to-ukef';

const { BANK1_CHECKER1 } = MOCK_USERS;

/**
 * Checker submits a portal amendment to UKEF
 * @param {String} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {String} param.submittedUrl - the URL to the approved by ukef page
 */
export const checkerSubmitsPortalAmendmentRequest = ({ amendmentDetailsUrl, submittedUrl }) => {
  cy.login(BANK1_CHECKER1);

  cy.visit(relative(amendmentDetailsUrl));

  cy.clickSubmitButton();

  submitToUkef.confirmSubmissionCheckbox().click();
  cy.clickSubmitButton();

  cy.url().should('eq', relative(submittedUrl));
};
