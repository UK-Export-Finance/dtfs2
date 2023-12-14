const { header, users, createUser, editUser } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN } = MOCK_USERS;

context('Admin user updates an existing user', () => {
  const userToUpdate = {
    username: 'email@example.com',
    email: 'email@example.com',
    password: 'AbC!2345',
    firstname: 'first',
    surname: 'last',
    bank: 'Barclays Bank',
    roles: ['maker'],
  };

  beforeEach(() => {
    cy.removeUserIfPresent(userToUpdate, ADMIN);
  });

  it('Create a user, then edit the user and change their role(s)', () => {
    // login and go to dashboard
    cy.login(ADMIN);
    header.users().click();

    // add user
    users.addUser().click();
    userToUpdate.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(userToUpdate.username);
    createUser.firstname().type(userToUpdate.firstname);
    createUser.surname().type(userToUpdate.surname);
    createUser.bank().select(userToUpdate.bank);
    createUser.createUser().click();

    cy.userSetPassword(userToUpdate.username, userToUpdate.password);

    // rely on existing 'create user' spec to prove default state

    // edit user +  de-activate
    users.visit();
    users.row(userToUpdate).username().click();
    editUser.Deactivate().click();
    editUser.save().click();

    // prove we can't log in as user
    cy.enterUsernameAndPassword(userToUpdate);
    cy.url().should('eq', relative('/login'));

    // go back to admin user and re-activate
    cy.login(ADMIN);
    header.users().click();
    users.row(userToUpdate).username().click();
    editUser.Activate().click();
    editUser.save().click();

    // prove we can log in again
    cy.login(userToUpdate);
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
