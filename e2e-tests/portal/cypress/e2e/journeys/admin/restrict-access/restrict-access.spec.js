const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');

const validUsers = ['ADMIN', 'UKEF_OPERATIONS'];
const invalidUsers = ['BANK1_MAKER1', 'BANK1_CHECKER1', 'EDITOR'];

context('Only allow authorised users to access admin pages', () => {
  it('should allow Admins access to restricted pages', () => {
    const user = MOCK_USERS[validUsers[0]];
    cy.login(user);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/admin/users/'));
  });

  it('should allow UKEF Operations access to restricted pages', () => {
    const user = MOCK_USERS[validUsers[1]];
    cy.login(user);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/admin/users/'));
  });

  it('should NOT allow Makers access to restricted pages', () => {
    const user = MOCK_USERS[invalidUsers[0]];
    cy.login(user);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
  it('should NOT allow Checkers access to restricted pages', () => {
    const user = MOCK_USERS[invalidUsers[1]];
    cy.login(user);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
  it('should NOT allow Editors access to restricted pages', () => {
    const user = MOCK_USERS[invalidUsers[2]];
    cy.login(user);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/login'));
  });
});
