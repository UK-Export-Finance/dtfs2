const { login, landingPage, header, beforeYouStart, bankDetails, dashboardDeals } = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1, BANK1_CHECKER1, ADMINNOMAKER, BANK1_READ_ONLY1, BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

const BAD_LOGIN = { username: 'invalid', password: 'valid' };

context('Login', () => {
  beforeEach(() => {
    const { username } = BANK1_MAKER1;
    cy.getUserByUsername(username);
    cy.resetPortalUserStatusAndNumberOfSignInLinks(username);
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
    cy.keyboardInput(landingPage.password(), 'mockpass');
    landingPage.login().click();

    const emailError = 'Enter an email address in the correct format';
    landingPage.expectError(emailError);
    landingPage.emailError(emailError);

    cy.url().should('eq', relative('/login'));
  });

  it('Shows an error if password field is empty', () => {
    cy.keyboardInput(landingPage.email(), 'mock user');
    landingPage.login().click();

    const passwordError = 'Enter a valid password';

    landingPage.expectError(passwordError);
    landingPage.passwordError(passwordError);

    cy.url().should('eq', relative('/login'));
  });

  it('A failed login leaves the user on the landing page', () => {
    cy.title().should('eq', 'Log in - UK Export Finance');

    cy.enterUsernameAndPassword(BAD_LOGIN);

    cy.url().should('eq', relative('/login'));
  });

  it('Entering a valid username and password takes the user to the /login/check-your-email page and does not give the user access to protected routes', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.url().should('eq', relative('/login/check-your-email'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('A successful login with maker role takes the user to the /dashboard/deals/0 page', () => {
    cy.login(BANK1_MAKER1);

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A successful login with checker role takes the user to the /dashboard/deals/0 page', () => {
    cy.login(BANK1_CHECKER1);

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A successful login with admin role takes the user to the /dashboard/deals/0 page', () => {
    cy.login(ADMINNOMAKER);

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A successful login with read-only role takes the user to the /dashboard/deals/0 page', () => {
    cy.login(BANK1_READ_ONLY1);

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('A successful login with payment report officer role takes the user to the /utilisation-report-upload page', () => {
    cy.login(BANK1_PAYMENT_REPORT_OFFICER1);

    cy.url().should('eq', relative('/utilisation-report-upload'));
  });

  it('Logged-in user home link should point to gov.uk', () => {
    cy.login(BANK1_MAKER1);

    header
      .header()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('https://www.gov.uk/');
      });
  });

  it('When a logged-in user clicks the dashboard link they go to the /dashboard page', () => {
    cy.login(BANK1_MAKER1);

    header.dashboard().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
