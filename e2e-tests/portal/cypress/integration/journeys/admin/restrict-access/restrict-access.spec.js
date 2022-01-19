const { users, header } = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');

const validUsers = ['ADMIN', 'UKEF_OPERATIONS'];
const invalidUsers = ['MAKER', 'CHECKER', 'EDITOR'];

context('Only allow authorised users to access admin pages', () => {
  context('User admin', () => {
    it('Valid users can access', () => {
      // login and go to dashboard
      validUsers.forEach((validUser) => {
        const user = mockUsers.find((mockUser) => (mockUser.username.includes(validUser)));
        cy.login(user);
        users.visit();

        cy.url().should('eq', relative('/admin/users/'));
        header.logOut();
      });
    });

    it('Invalid users cannot access', () => {
      // login and go to dashboard
      invalidUsers.forEach((invalidUser) => {
        const user = mockUsers.find((mockUser) => (mockUser.username.includes(invalidUser)));
        cy.login(user);
        users.visit();

        cy.url().should('eq', relative('/not-found'));
        header.logOut();
      });
    });
  });
});
