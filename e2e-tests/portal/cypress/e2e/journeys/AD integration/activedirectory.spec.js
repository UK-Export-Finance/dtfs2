const {
  header,
  beforeYouStart,
  bankDetails,
  dashboardDeals,
} = require('../../pages');
const relative = require('../../relativeURL');
const MOCK_USERS = require('../../../fixtures/users');

const { BANK1_MAKER1 } = MOCK_USERS;

const BAD_LOGIN = { username: 'invalid', password: 'valid' };

context('Login', () => {
  beforeEach(() => {
    beforeYouStart.visit();
  });

  it('When a user that is not logged in navigates to a protected route, they are sent to the homepage', () => {
    cy.url().should('eq', relative('/login'));

    bankDetails.visit();
    cy.url().should('eq', relative('/login'));

    dashboardDeals.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('A failed login leaves the user on the landing page', () => {
    cy.title().should('eq', 'Log in - UK Export Finance');

    cy.login(BAD_LOGIN);

    cy.url().should('eq', relative('/login'));
  });

  it('A successful login takes the user to the /dashboard/deals/0 page', () => {
    cy.login(BANK1_MAKER1);

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('Logged-in user home link should point to gov.uk', () => {
    cy.login(BANK1_MAKER1);

    header.home().invoke('attr', 'href').then((href) => {
      expect(href).to.equal('https://www.gov.uk');
    });
  });
});
