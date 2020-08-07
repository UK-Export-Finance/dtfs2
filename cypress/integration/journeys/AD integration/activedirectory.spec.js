const {
  header,
  startNow,
  beforeYouStart,
  bankDetails,
  dashboard,
} = require('../../pages');
const relative = require('../../relativeURL');

const mockUsers = require('../../../fixtures/mockUsers');
const BAD_LOGIN = {username: 'doesntExist', password: 'whatever'};
const MAKER_LOGIN = mockUsers.find( user=> (user.roles.includes('maker')) );

context('Login', () => {
  beforeEach(() => {
    // [ dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('When a user that is not logged in navigates to a protected route, they progress to the login page', () => {
    startNow.visit();
    cy.url().should('eq', relative('/'));

    beforeYouStart.visit();
    cy.url().should('eq', relative('/'));

    bankDetails.visit();
    cy.url().should('eq', relative('/'));

    dashboard.visit();
    cy.url().should('eq', relative('/'));
  });

  it('A failed login leaves the user on the landing page', () => {
    cy.title().should('eq', 'Log in - UK Export Finance');

    cy.login(BAD_LOGIN);

    cy.url().should('eq', relative('/'));
  });

  it('A successful login takes the user to the /start-now page', () => {
    cy.login(MAKER_LOGIN);

    cy.url().should('eq', relative('/start-now'));
  });

  it('When a logged-in user clicks the home link they go to the /start-now page', () => {
    cy.login(MAKER_LOGIN);

    header.home().click();

    cy.url().should('eq', relative('/start-now'));
  });

  it('When a logged-in user clicks the dashboard link they go to the /dashboard page', () => {
    cy.login(MAKER_LOGIN);

    header.dashboard().click();

    cy.url().should('eq', relative('/dashboard/0'));
  });
});
