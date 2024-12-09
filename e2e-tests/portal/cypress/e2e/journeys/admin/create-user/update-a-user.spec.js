const { header, users, createUser, editUser } = require('../../../pages');
const { ADMIN: AN_ADMIN } = require('../../../../../../e2e-fixtures');
const {
  USER_ROLES: { ADMIN, MAKER, CHECKER },
} = require('../../../../fixtures/constants');
const relative = require('../../../relativeURL');

context('Admin user updates an existing user', () => {
  const userToUpdate = {
    username: 'email@example.com',
    email: 'email@example.com',
    password: 'AbC!2345',
    firstname: 'first',
    surname: 'last',
    bank: 'Barclays Bank',
    roles: [MAKER],
  };

  const ukefEmailUser = {
    ...userToUpdate,
    username: 'admin1@ukexportfinance.gov.uk',
    email: 'admin1@ukexportfinance.gov.uk',
    roles: [ADMIN],
  };

  beforeEach(() => {
    // Remove users
    cy.removeUserIfPresent(userToUpdate, AN_ADMIN);
    cy.removeUserIfPresent(ukefEmailUser, AN_ADMIN);

    // Login and go to the dashboard
    cy.login(AN_ADMIN);
    cy.url().should('include', '/dashboard/deals');

    // Navigate
    header.users().click();
    cy.url().should('include', '/admin/users');

    users.addUser().click();
    cy.url().should('include', '/admin/users/create');

    // Fill in details
    cy.keyboardInput(createUser.username(), userToUpdate.username);
    cy.keyboardInput(createUser.firstname(), userToUpdate.firstname);
    cy.keyboardInput(createUser.surname(), userToUpdate.surname);

    userToUpdate.roles.forEach((role) => {
      createUser.role(role).click();
    });

    createUser.bank().select(userToUpdate.bank);

    // Create user
    createUser.createUser().click();
    cy.url().should('include', '/admin/users');
  });

  const openPageToEdit = (user) => users.row(user).username().click();

  it('clicking cancel from the users pages takes you to the deals dashboard', () => {
    users.cancel().click();
    cy.url().should('include', '/dashboard/deals');
  });

  it('changing their roles should display the new roles on the user dashboard', () => {
    const newRole = CHECKER;
    openPageToEdit(userToUpdate);

    // switch off all of the users roles
    userToUpdate.roles.forEach((role) => {
      editUser.role(role).click();
    });

    editUser.role(newRole).click();

    editUser.save().click();

    cy.assertText(users.row(userToUpdate).roles(), newRole);
  });

  it('changing their trusted status should display the new status on the user dashboard', () => {
    users.row(userToUpdate).trusted().should('not.exist');
    cy.getUserByUsername(userToUpdate.username).then(({ isTrusted }) => {
      expect(isTrusted).to.equal(false);
    });

    openPageToEdit(userToUpdate);
    editUser.isTrustedTrue().click();
    editUser.save().click();

    users.row(userToUpdate).trusted().should('exist');
    cy.getUserByUsername(userToUpdate.username).then(({ isTrusted }) => {
      expect(isTrusted).to.equal(true);
    });

    openPageToEdit(userToUpdate);
    editUser.isTrustedFalse().click();
    editUser.save().click();

    users.row(userToUpdate).trusted().should('not.exist');
    cy.getUserByUsername(userToUpdate.username).then(({ isTrusted }) => {
      expect(isTrusted).to.equal(false);
    });
  });

  it('changing their details should display the new details when the edit page is reloaded', () => {
    const newFirstName = 'new first name';
    const newSurname = 'new surname';
    const newRole = CHECKER;

    openPageToEdit(userToUpdate);

    cy.keyboardInput(editUser.firstname(), `{selectAll}{backspace}${newFirstName}`);
    cy.keyboardInput(editUser.surname(), `{selectAll}{backspace}${newSurname}`);

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

  it('changing role to admin on non-ukef user should display an error', () => {
    // Go to edit page
    openPageToEdit(userToUpdate);

    // New role as an `Admin`
    editUser.role(ADMIN).click();
    editUser.save().click();

    // Assert role input error
    createUser.rolesError().should('contain', 'The admin role can only be associated with a UKEF email address');

    // Go back and validate the role
    createUser.cancel().click();
    cy.url().should('eq', relative('/admin/users/'));
    cy.assertText(users.row(userToUpdate).roles(), MAKER);
  });

  it('changing role to admin on a ukef user should update their role', () => {
    // Create user
    users.addUser().click();

    // Create a new UKEF user
    cy.keyboardInput(createUser.username(), ukefEmailUser.username);
    cy.keyboardInput(createUser.firstname(), ukefEmailUser.firstname);
    cy.keyboardInput(createUser.surname(), ukefEmailUser.surname);

    userToUpdate.roles.forEach((role) => {
      createUser.role(role).click();
    });

    createUser.bank().select(ukefEmailUser.bank);

    // Create user
    createUser.createUser().click();

    // Go to edit page
    openPageToEdit(ukefEmailUser);

    // New role as an `Admin`
    editUser.role(MAKER).click();
    editUser.role(ADMIN).click();
    editUser.save().click();

    // Assert
    cy.url().should('eq', relative('/admin/users'));
    cy.assertText(users.row(ukefEmailUser).roles(), ADMIN);
  });
});
