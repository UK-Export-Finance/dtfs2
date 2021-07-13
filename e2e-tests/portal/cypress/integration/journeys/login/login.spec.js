const {
  login,
  landingPage,
  header,
  beforeYouStart,
  bankDetails,
  dashboard,
} = require('../../pages');
const relative = require('../../relativeURL');

const mockUsers = require('../../../fixtures/mockUsers');

const BAD_LOGIN = { username: 'doesntExist', password: 'whatever' };
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker')));

context('Login', () => {
  beforeEach(() => {
    // [ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
    login.visit();
  });

  it('When a user that is not logged in navigates to a protected route, they progress to the login page', () => {
    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));

    bankDetails.visit();
    cy.url().should('eq', relative('/login'));

    dashboard.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('The reset password link takes you to reset password page', () => {
    login.resetPasswordLink().click();
    cy.url().should('eq', relative('/reset-password'));
  });

  it('Shows an error if email field is empty', () => {
    landingPage.password().type('mockpass');
    landingPage.login().click();

    const emailError = 'Enter an email address in the correct format';
    landingPage.expectError(emailError);
    landingPage.emailError(emailError);

    cy.url().should('eq', relative('/login'));
  });

  it('Shows an error if password field is empty', () => {
    landingPage.email().type('mock user');
    landingPage.login().click();

    const passwordError = 'Enter a valid password';

    landingPage.expectError(passwordError);
    landingPage.passwordError(passwordError);

    cy.url().should('eq', relative('/login'));
  });

  it('A failed login leaves the user on the landing page', () => {
    cy.title().should('eq', 'Log in - UK Export Finance');

    cy.login(BAD_LOGIN);

    cy.url().should('eq', relative('/login'));
  });

  it('A successful login takes the user to the /dashboard page', () => {
    cy.login(MAKER_LOGIN);

    cy.url().should('eq', relative('/dashboard/0'));
  });

  it('Logged-in user home link should point to gov.uk', () => {
    cy.login(MAKER_LOGIN);

    header.home().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('https://www.gov.uk');
    });
  });

  it('When a logged-in user clicks the dashboard link they go to the /dashboard page', () => {
    cy.login(MAKER_LOGIN);

    header.dashboard().click();

    cy.url().should('eq', relative('/dashboard/0'));
  });

  it('When a logged-in user clicks the service name link they go to the /dashboard page', () => {
    cy.login(MAKER_LOGIN);

    header.serviceName().click();

    cy.url().should('eq', relative('/dashboard/0'));
  });

  /*
  it('Should pass Lighthouse audit', () => {
    cy.lighthouse({
      performance: 85,
      accessibility: 100,
      'best-practices': 85,
      seo: 85,
      pwa: 100,
    });
    cy.pa11y();
  });
  */
});
