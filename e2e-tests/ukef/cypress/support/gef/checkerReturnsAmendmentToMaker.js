import MOCK_USERS from '../../../../e2e-fixtures/portal-users.fixture';
import relative from '../../e2e/relativeURL';
import returnToMaker from '../../../../gef/cypress/e2e/pages/return-to-maker';

const { BANK1_CHECKER1 } = MOCK_USERS;

/**
 * Checker returns an amendment to the maker with comments
 * @param {string} param.amendmentDetailsUrl - the URL to the amendment details page
 * @param {string} param.confirmReturnToMakerUrl - the URL to the confirm return amendment to maker page
 * @param {string} param.submittedUrl - the URL to the approved returned the amendment to maker page
 */
export const checkerReturnsAmendmentToMaker = ({ amendmentDetailsUrl, confirmReturnToMakerUrl, submittedUrl }) => {
  cy.login(BANK1_CHECKER1);

  cy.visit(relative(amendmentDetailsUrl));
  cy.url().should('eq', relative(amendmentDetailsUrl));

  cy.clickReturnToMakerButton();
  cy.url().should('eq', relative(confirmReturnToMakerUrl));

  cy.keyboardInput(returnToMaker.comment(), 'go');
  cy.clickSubmitButton();

  cy.url().should('eq', relative(submittedUrl));
};
