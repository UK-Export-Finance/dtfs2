const { users, header } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');

const validUsers = ['ADMIN', 'UKEF_OPERATIONS'];
const invalidUsers = ['BANK1_MAKER1', 'BANK1_CHECKER1', 'EDITOR'];

context('Only allow authorised users to access admin pages', () => {
  context('User admin', () => {
    it('Valid users can access', () => {
      // login and go to dashboard
      validUsers.forEach((validUser) => {
        const user = MOCK_USERS[validUser];
        cy.login(user);
        users.visit();

        cy.url().should('eq', relative('/admin/users/'));
        header.logOut();
      });
    });

    it('Invalid users cannot access', () => {
      // login and go to dashboard
      invalidUsers.forEach((invalidUser) => {
        const user = MOCK_USERS[invalidUser];
        cy.login(user);
        users.visit();

        cy.url().should('eq', relative('/not-found'));
        header.logOut();
      });
    });
  });
});
