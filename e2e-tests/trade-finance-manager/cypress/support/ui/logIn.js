import pages from '../../integration/pages';

export default (opts) => {
  const { username, password } = opts;

  pages.landingPage.visit();
  pages.landingPage.email().type(username);
  pages.landingPage.password().type(password);
  pages.landingPage.submitButton().click();
};
