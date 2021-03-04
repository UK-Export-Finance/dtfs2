import pages from '../../integration/pages';

export default (opts) => {
  const { username } = opts;

  pages.landingPage.visit();
  pages.landingPage.email().type(username);
  // pages.landingPage.password().type(password);
  pages.landingPage.submitButton().click();
};
