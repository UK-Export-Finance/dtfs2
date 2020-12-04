import pages from '../../integration/pages';

export default (opts) => {
  const { email, password } = opts;

  pages.landingPage.visit();
  pages.landingPage.email().type(email);
  pages.landingPage.password().type(password);
  pages.landingPage.submitButton().click();
};
