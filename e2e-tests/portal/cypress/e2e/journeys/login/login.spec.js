const {
  login, landingPage, header, beforeYouStart, bankDetails, dashboardDeals, signInLink,
} = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;

const BAD_LOGIN = { username: 'invalid', password: 'valid' };
const SIGN_IN_TOKEN = '1111111111abcdef1111111111abcdef1111111111abcdef1111111111abcdef';
const INVALID_SIGN_IN_TOKEN = '6569ca7a6fd828f925e07999';

context('Login', () => {
  let bank1Maker1Id;

  beforeEach(() => {
    const { username } = BANK1_MAKER1;
    cy.getUserByUsername(username).then(({ _id }) => {
      bank1Maker1Id = _id;
    });
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

    cy.enterUsernameAndPassword(BAD_LOGIN);

    cy.url().should('eq', relative('/login'));
  });

  it('Entering a valid username and password takes the user to the /login/check-your-email page and does not give the user access to protected routes', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.url().should('eq', relative('/login/check-your-email'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening an invalid sign in link takes the user to the /login/sign-in-link-expired page and does not give the user access to protected routes', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    signInLink.visit({ token: INVALID_SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Opening a valid sign in link takes the user to the /dashboard page and gives the user access to protected routes', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.overridePortalUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: SIGN_IN_TOKEN });

    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/dashboard/deals/0'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/before-you-start'));
  });

  it('Opening a previous sign in link redirects the user to the /login/sign-in-link expired page and does not give the user access to protected routes', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.overridePortalUserSignInTokenByUsername({ username: BANK1_MAKER1.username, newSignInToken: SIGN_IN_TOKEN });

    cy.enterUsernameAndPassword(BANK1_MAKER1);
    signInLink.visit({ token: SIGN_IN_TOKEN, userId: bank1Maker1Id });
    cy.url().should('eq', relative('/login/sign-in-link-expired'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('Logged-in user home link should point to gov.uk', () => {
    cy.login(BANK1_MAKER1);

    header
      .home()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal('https://www.gov.uk');
      });
  });

  it('When a logged-in user clicks the dashboard link they go to the /dashboard page', () => {
    cy.login(BANK1_MAKER1);

    header.dashboard().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('When a logged-in user clicks the service name link they go to the /dashboard page', () => {
    cy.login(BANK1_MAKER1);

    header.serviceName().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
