import { tfmPages } from '../../e2e/pages';

export const login = (opts) => {
  const { username, password } = opts;

  tfmPages.landingPage.visit();
  cy.keyboardInput(tfmPages.landingPage.email(), username);
  cy.keyboardInput(tfmPages.landingPage.password(), password);
  cy.clickSubmitButton();
};
