const {
  header, users, createUser, editUser,
} = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');

const { ADMIN } = MOCK_USERS;

context('Admin user updates an existing user', () => {
  const userToUpdate = {
    username: 'another.address@some.com',
    email: 'another.address@some.com',
    password: 'Aleg1tP@ssword',
    firstname: 'bobert',
    surname: 'the builder',
    bank: 'Barclays Bank',
    roles: ['maker'],
  };

  beforeEach(() => {
    cy.removeUserIfPresent(userToUpdate, ADMIN);
  });

  it('Go to users and back', () => {
    // Login and go to the dashboard
    cy.login(ADMIN);
    cy.url().should('include', '/dashboard/deals');
    header.users().click();

    // Cancel
    users.cancel().click();

    // Back to the dashboard
    cy.url().should('include', '/dashboard/deals');
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
    createUser.manualPassword().click();
    createUser.password().type(userToUpdate.password);
    createUser.confirmPassword().type(userToUpdate.password);
    createUser.firstname().type(userToUpdate.firstname);
    createUser.surname().type(userToUpdate.surname);
    createUser.bank().select(userToUpdate.bank);
    createUser.createUser().click();

    users.row(userToUpdate).username().click();

    // switch off everything we selected before
    userToUpdate.roles.forEach((role) => {
      editUser.role(role).click();
    });

    editUser.role('checker').click();
    editUser.firstname().type('{selectAll}{backspace}Homer');
    editUser.surname().type('{selectAll}{backspace}Simpson');

    editUser.save().click();

    users.row(userToUpdate).roles().invoke('text').then((text) => {
      expect(text.trim()).to.equal('checker');
    });
  });
});
