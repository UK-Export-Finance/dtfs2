const {
  header, users, createUser, userProfile, changePassword,
} = require('../../pages');
const relative = require('../../relativeURL');

const MOCK_USERS = require('../../../fixtures/users');

const { ADMIN } = MOCK_USERS;

context('Admin user creates a new user; the new user updates their password.', () => {
  const userToCreate = {
    username: 'another.address@some.com',
    password: 'Aleg1tP@ssword',
    firstname: 'bobert',
    surname: 'the builder',
    bank: 'Barclays Bank',
    roles: ['maker'],
  };

  beforeEach(() => {
    cy.removeUserIfPresent(userToCreate, ADMIN);
  });

  it('Create a user, then edit the user and change their password, triggering validation en route', () => {
    // login and go to dashboard
    cy.login(ADMIN);
    header.users().click();

    // add user
    users.addUser().click();

    userToCreate.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(userToCreate.username);
    createUser.manualPassword().click();
    createUser.password().type(userToCreate.password);
    createUser.confirmPassword().type(userToCreate.password);
    createUser.firstname().type(userToCreate.firstname);
    createUser.surname().type(userToCreate.surname);
    createUser.bank().select(userToCreate.bank);
    createUser.createUser().click();
    // shouldn't be failing but, if this hasn't worked no point in flagging
    //  any other failure further down...
    cy.url().should('eq', relative('/admin/users/'));

    // log in as our user + try to change the password to an invalid password..
    cy.login(userToCreate);
    header.profile().click();
    userProfile.changePassword().click();
    changePassword.currentPassword().type(userToCreate.password);
    changePassword.password().type('fail');
    changePassword.confirmPassword().type('fail');
    changePassword.submit().click();

    // expect failure
    cy.url().should('match', /change-password/);
    changePassword.passwordError().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.');
    });

    // try changing with wrong current password
    changePassword.currentPassword().type('wrongPassword');
    changePassword.password().type('P4ssPl£ase');
    changePassword.confirmPassword().type('P4ssPl£ase');
    changePassword.submit().click();

    // expect failure
    cy.url().should('match', /change-password/);
    changePassword.currentPasswordError().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Current password is not correct.');
    });

    // try to change to a legit password
    changePassword.currentPassword().type(userToCreate.password);
    changePassword.password().type('P4ssPl£ase');
    changePassword.confirmPassword().type('P4ssPl£ase');
    changePassword.submit().click();

    // prove that we can log in with the new password..
    cy.login({
      ...userToCreate,
      password: 'P4ssPl£ase',
    });
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // prove that we cant re-use an old password
    header.profile().click();
    userProfile.changePassword().click();
    changePassword.currentPassword().type(userToCreate.password);
    changePassword.password().type(userToCreate.password);
    changePassword.confirmPassword().type(userToCreate.password);
    changePassword.submit().click();

    // expect failure
    cy.url().should('match', /change-password/);
    changePassword.passwordError().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.');
    });
  });
});
