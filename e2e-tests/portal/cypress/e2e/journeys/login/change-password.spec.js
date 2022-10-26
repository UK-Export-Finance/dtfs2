const {
  header, users, createUser, userProfile, changePassword, landingPage,
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

  before(() => {
    cy.removeUserIfPresent(userToCreate, ADMIN);
  });

  describe('Admin page', () => {
    it('Should create a new user with Maker role', () => {
      // Login and go to the dashboard
      cy.login(ADMIN);
      header.users().click();

      // Go to add user page
      users.addUser().click();
      cy.url().should('include', '/admin/users/create');

      // Input
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

      // Create user
      createUser.createUser().click();
      cy.url().should('eq', relative('/admin/users/'));
    });
  });

  describe('User profile page', () => {
    it('Should go back to the dashboard', () => {
      // Login
      cy.login(userToCreate);

      // Go to profile
      header.profile().click();

      // Cancel and go back
      userProfile.cancel().click();
      cy.url().should('include', '/dashboard');
    });

    it('Should go back to the profile page', () => {
      // Login
      cy.login(userToCreate);

      // Go to profile
      header.profile().click();

      // Goto change password screen
      userProfile.changePassword().click();
      cy.url().should('include', '/user/');

      // Go back to the profile page
      changePassword.cancel().click();
      cy.url().should('include', '/user/');
    });

    it('Should validate the user fields', () => {
      // Login
      cy.login(userToCreate);

      // Go to profile
      header.profile().click();
      cy.url().should('include', '/user/');

      // Change password
      userProfile.changePassword().click();

      // Input
      changePassword.currentPassword().type(userToCreate.password);
      changePassword.password().type('fail');
      changePassword.confirmPassword().type('fail');
      changePassword.submit().click();

      // Expect failure
      cy.url().should('match', /change-password/);
      changePassword.passwordError().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.');
      });

      // Try changing with wrong current password
      changePassword.currentPassword().type('wrongPassword');
      changePassword.password().type('P4ssPl£ase');
      changePassword.confirmPassword().type('P4ssPl£ase');
      changePassword.submit().click();

      // Expect failure
      cy.url().should('match', /change-password/);
      changePassword.currentPasswordError().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Current password is not correct.');
      });

      // Try changing it to a password that is too short
      changePassword.currentPassword().type('Aleg1tP@ssword');
      changePassword.password().type(' ');
      changePassword.confirmPassword().type(' ');
      changePassword.submit().click();

      changePassword.passwordError().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.');
      });
    });

    it('should change the password', () => {
      cy.login(userToCreate);
      header.profile().click();
      userProfile.changePassword().click();
      // try to change to a legit password
      changePassword.currentPassword().type(userToCreate.password);
      changePassword.password().type('P4ssPl£ase');
      changePassword.confirmPassword().type('P4ssPl£ase');
      changePassword.submit().click();
    });

    it('should allow users to log in using the new credentials', () => {
      cy.login({
        ...userToCreate,
        password: 'P4ssPl£ase',
      });
      cy.url().should('eq', relative('/dashboard/deals/0'));
    });

    it('should NOT allow users to log in using the old credentials', () => {
      cy.login(userToCreate);
      landingPage.emailError('Enter an email address in the correct format, for example, name@example.com');
    });

    it('should NOT allow users to re-use an old password', () => {
      cy.login({
        ...userToCreate,
        password: 'P4ssPl£ase',
      });
      header.profile().click();
      userProfile.changePassword().click();

      changePassword.currentPassword().should('exist');
      changePassword.password().should('exist');
      changePassword.confirmPassword().should('exist');

      changePassword.currentPassword().type('P4ssPl£ase');
      changePassword.password().type('Aleg1tP@ssword');
      changePassword.confirmPassword().type('Aleg1tP@ssword');
      changePassword.submit().click();

      // expect failure
      cy.url().should('match', /change-password/);
      changePassword.passwordError().invoke('text').then((text) => {
        expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.');
      });
    });
  });
});
