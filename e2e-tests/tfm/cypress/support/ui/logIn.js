// import pages from '../../e2e/pages';

export default (opts) => {
  // TODO: cleanup
  // const { username, password } = opts;
  // console.log('NO OLD TFM LOGIN');
  cy.mockLogin(opts);
  // pages.landingPage.visit();
  // pages.landingPage.email().type(username);
  // pages.landingPage.password().type(password);
  // pages.landingPage.submitButton().click();
};
