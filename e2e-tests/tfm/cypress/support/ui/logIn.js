import pages from '../../e2e/pages';

export default (opts) => {
  const { username, password } = opts;

  pages.landingPage.visit();
  cy.keyboardInput(pages.landingPage.email(), username);
  cy.keyboardInput(pages.landingPage.password(), password);
  cy.clickSubmitButton();
};
