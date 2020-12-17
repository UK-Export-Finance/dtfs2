const { users, header } = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const validUsers = ['ADMIN', 'UKEF_OPERATIONS'];
const invalidUsers = ['MAKER', 'CHECKER', 'EDITOR'];

context('Only allow authorised users to access admin pages', () => {
  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('Valid users can access', () => {
    // login and go to dashboard
    validUsers.forEach((validUser) => {
      const user = mockUsers.find((user) => (user.username.includes(validUser)));
      cy.login(user);
      users.visit();

      cy.url().should('eq', relative('/admin/users/'));
      header.logOut();
    });
  });

  it('invalid users cannot access', () => {
    // login and go to dashboard
    invalidUsers.forEach((invalidUser) => {
      const user = mockUsers.find((user) => (user.username.includes(invalidUser)));
      cy.login(user);
      users.visit();

      cy.url().should('eq', relative('/not-found'));
      header.logOut();
    });
  });
});
