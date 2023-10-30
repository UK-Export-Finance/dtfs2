const {
  login,
  landingPage,
  header,
  beforeYouStart,
  bankDetails,
  dashboardDeals,
} = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const {
  BANK1_MAKER1,
  BANK1_CHECKER1,
  ADMINNOMAKER,
  BANK1_READ_ONLY1,
  BANK1_PAYMENT_REPORT_OFFICER1,
} = MOCK_USERS;

const BAD_LOGIN = { username: 'invalid', password: 'valid' };

context('Login', () => {
  beforeEach(() => {
    login.visit();
  });

  it('When a user that is not logged in navigates to a protected route, they progress to the login page', () => {
    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));

    bankDetails.visit();
    cy.url().should('eq', relative('/login'));

    dashboardDeals.visit();
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

  it.each([
    ['maker', '/dashboard/deals/0', BANK1_MAKER1],
    ['checker', '/dashboard/deals/0', BANK1_CHECKER1],
    ['admin', '/dashboard/deals/0', ADMINNOMAKER],
    ['read-only', '/dashboard/deals/0', BANK1_READ_ONLY1],
    ['payment report officer', '/utilisation-report-upload', BANK1_PAYMENT_REPORT_OFFICER1],
  ])('A successful login with %s role takes the user to the %s page', (role, url, user) => {
    cy.login(user);

    cy.url().should('eq', relative(url));
  });

  it('Logged-in user home link should point to gov.uk', () => {
    cy.login(BANK1_MAKER1);

    header.home().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('https://www.gov.uk');
    });
  });

  it('When a logged-in user clicks the service name link they go to the /dashboard page', () => {
    cy.login(BANK1_MAKER1);

    header.serviceName().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
