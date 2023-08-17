const {
  header, users, createUser, editUser,
} = require('../../../pages');
const { ADMIN } = require('../../../../fixtures/users');

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
    cy.login(ADMIN);
    header.users().click();
  });

  it('clicking cancel from the users pages takes you to the deals dashboard', () => {
    users.cancel().click();
    cy.url().should('include', '/dashboard/deals');
  });

  context('given a user already exists', () => {
    const openPageToEdit = (user) => users.row(user).username().click();

    beforeEach(() => {
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
    });

    it('changing their roles should display the new roles on the user dashboard', () => {
      const newRole = 'checker';
      openPageToEdit(userToUpdate);

      // switch off all of the users roles
      userToUpdate.roles.forEach((role) => {
        editUser.role(role).click();
      });

      editUser.role(newRole).click();

      editUser.save().click();

      users.row(userToUpdate).roles().invoke('text').then((text) => {
        expect(text.trim()).to.equal(newRole);
      });
    });

    it('changing their details should display the new details when the edit page is reloaded', () => {
      const newFirstName = 'new first name';
      const newSurname = 'new surname';
      const newRole = 'checker';

      openPageToEdit(userToUpdate);

      editUser.firstname().type(`{selectAll}{backspace}${newFirstName}`);
      editUser.surname().type(`{selectAll}{backspace}${newSurname}`);
      // switch off all of the users roles
      userToUpdate.roles.forEach((role) => {
        editUser.role(role).click();
      });
      editUser.role(newRole).click();
      editUser.save().click();

      openPageToEdit(userToUpdate);

      editUser.firstname().should('have.value', newFirstName);
      editUser.surname().should('have.value', newSurname);
      userToUpdate.roles.forEach((role) => {
        editUser.role(role).should('not.be.checked');
      });
      editUser.role(newRole).should('be.checked');
    });
  });
});
