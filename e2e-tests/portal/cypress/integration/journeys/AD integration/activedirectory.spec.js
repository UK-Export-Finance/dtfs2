const {
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
  it('When a user that is not logged in navigates to a protected route, they are sent to the homepage', () => {
    beforeYouStart.visit();
    cy.url().should('eq', relative('/login'));

    bankDetails.visit();
    cy.url().should('eq', relative('/login'));

    dashboard.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('A failed login leaves the user on the landing page', () => {
    cy.title().should('eq', 'Log in - UK Export Finance');

    cy.login(BAD_LOGIN);

    cy.url().should('eq', relative('/login'));
  });

  it('A successful login takes the user to the /dashboard page', () => {
    cy.login(MAKER_LOGIN);

    cy.url().should('eq', relative('/dashboard/deals/0'));
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

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
