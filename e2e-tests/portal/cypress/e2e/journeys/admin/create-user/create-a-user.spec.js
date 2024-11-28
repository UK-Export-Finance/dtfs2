const { header, users, createUser, changePassword } = require('../../../pages');
const relative = require('../../../relativeURL');
const {
  USER_ROLES: { ADMIN, MAKER, READ_ONLY, CHECKER, PAYMENT_REPORT_OFFICER },
} = require('../../../../fixtures/constants');
const { ADMIN: AN_ADMIN, USER_WITH_INJECTION } = require('../../../../../../e2e-fixtures/portal-users.fixture');

context('Admin user creates a new user', () => {
  const validUser = {
    username: 'an.address@some.com',
    email: 'an.address@some.com',
    password: 'AbC!2345',
    firstname: 'bob',
    surname: 'builder',
    bank: 'HSBC',
    roles: [MAKER],
  };

  const userWithInvalidPassword = {
    username: 'email@example.com',
    email: 'email@example.com',
    password: 'aaa',
    firstname: 'alfred',
    surname: 'd. great',
    bank: 'HSBC',
    roles: [MAKER],
  };

  const ukefEmailUser = {
    ...validUser,
    username: 'adminukefuser@ukexportfinance.gov.uk',
    email: 'adminukefuser@ukexportfinance.gov.uk',
  };

  beforeEach(() => {
    cy.removeUserIfPresent(validUser, AN_ADMIN);
    cy.removeUserIfPresent(userWithInvalidPassword, AN_ADMIN);
    cy.removeUserIfPresent(ukefEmailUser, AN_ADMIN);

    // Login and go to the dashboard
    cy.login(AN_ADMIN);
    cy.url().should('include', '/dashboard/deals');

    // Navigate
    header.users().click();
    cy.url().should('include', '/admin/users');

    users.addUser().click();
    cy.url().should('include', '/admin/users/create');

    // Validate
    users.user(validUser).should('not.exist');
    users.user(userWithInvalidPassword).should('not.exist');
  });

  context('Unhappy paths', () => {
    it('Go to add user page and back', () => {
      // Back to the users page
      createUser.cancel().click();
      cy.url().should('include', '/admin/users');
    });

    it('should display validation text if fields are left empty', () => {
      // Click the create user button without filling in the fields
      createUser.createUser().click();

      // Check if the validation text is displayed for the first name, surname, roles, and bank fields
      createUser.firstNameError().should('contain', 'First name is required');
      createUser.surNameError().should('contain', 'Surname is required');
      createUser.rolesError().should('contain', 'At least one role is required');
    });

    it('Admin create user with empty fields', () => {
      // Add user
      createUser.createUser().click();

      // Empty input, should get re-directed to user create page
      cy.url().should('include', '/admin/users/create');
    });

    it('Admin user adds a new user. User tries to set invalid password, triggering validation error', () => {
      userWithInvalidPassword.roles.forEach((role) => {
        createUser.role(role).click();
      });

      cy.keyboardInput(createUser.username(), userWithInvalidPassword.username);
      cy.keyboardInput(createUser.firstname(), userWithInvalidPassword.firstname);
      cy.keyboardInput(createUser.surname(), userWithInvalidPassword.surname);

      createUser.bank().select(userWithInvalidPassword.bank);

      createUser.createUser().click();

      cy.userSetPassword(userWithInvalidPassword.username, userWithInvalidPassword.password);

      changePassword
        .passwordError()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.contain(
            'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.',
          );
        });
    });

    it('Admin user adds a new user using "{ "$gt": "" }" as the email, triggering validation error', () => {
      userWithInvalidPassword.roles.forEach((role) => {
        createUser.role(role).click();
      });

      // as the string has object characters, need to use parseSpecialCharSequences
      createUser.username().type(USER_WITH_INJECTION.username, { delay: 0, parseSpecialCharSequences: false });
      cy.keyboardInput(createUser.firstname(), USER_WITH_INJECTION.firstname);
      cy.keyboardInput(createUser.surname(), USER_WITH_INJECTION.surname);

      createUser.bank().select(USER_WITH_INJECTION.bank);

      createUser.createUser().click();

      cy.url().should('eq', relative('/admin/users/create'));

      // checks html form validation pop up contains correct error message
      cy.get('input:invalid').should('have.length', 1);
      createUser.username().then(($input) => {
        expect($input[0].validationMessage).to.eq("Please include an '@' in the email address. '{\"$gt\":\"\"}' is missing an '@'.");
      });

      /**
       * to check that user has not been created
       * gets list of users from portal-api
       * finds one with email { "$gt": "" }
       * should be undefined
       */
      cy.listAllUsers(AN_ADMIN).then((usersInDb) => {
        const injectedUser = usersInDb.find((user) => Object.keys(user.email).length === 0);

        expect(injectedUser).to.be.an('undefined');
      });
    });

    it('should unselect other roles if the read-only role is selected', () => {
      createUser.role(MAKER).click();
      createUser.role(CHECKER).click();
      createUser.role(PAYMENT_REPORT_OFFICER).click();
      createUser.role(MAKER).should('be.checked');
      createUser.role(CHECKER).should('be.checked');
      createUser.role(PAYMENT_REPORT_OFFICER).should('be.checked');

      createUser.role(READ_ONLY).click();
      createUser.role(READ_ONLY).should('be.checked');
      createUser.role(MAKER).should('not.be.checked');
      createUser.role(CHECKER).should('not.be.checked');
      createUser.role(PAYMENT_REPORT_OFFICER).should('not.be.checked');
    });

    it('should unselect the read-only role if another role is selected', () => {
      createUser.role(READ_ONLY).click();
      createUser.role(READ_ONLY).should('be.checked');

      createUser.role(MAKER).click();
      createUser.role(MAKER).should('be.checked');
      createUser.role(READ_ONLY).should('not.be.checked');
    });
    // TODO: ADD lighthouse checks DTFS2-4994

    it('should receive error when the email address is from a non-UKEF domain', () => {
      // Fill in all the fields
      cy.keyboardInput(createUser.firstname(), validUser.firstname);
      cy.keyboardInput(createUser.surname(), validUser.surname);
      createUser.isTrustedFalse().click();
      createUser.role(ADMIN).click();
      cy.keyboardInput(createUser.username(), validUser.username);
      createUser.bank().select(validUser.bank);

      // Create user
      createUser.createUser().click();

      // Assert role input error
      createUser.rolesError().should('contain', 'The admin role can only be associated with a UKEF email address');

      // Assert URL
      cy.url().should('eq', relative('/admin/users/create'));
    });
  });

  context('Happy paths', () => {
    it('Admin user adds a new user and confirms the new user works once user sets password', () => {
      validUser.roles.forEach((role) => {
        createUser.role(role).click();
      });

      cy.keyboardInput(createUser.username(), validUser.username);
      cy.keyboardInput(createUser.firstname(), validUser.firstname);
      cy.keyboardInput(createUser.surname(), validUser.surname);

      createUser.bank().select(validUser.bank);

      createUser.createUser().click();

      cy.url().should('eq', relative('/admin/users/'));
      users.user(validUser).should('exist');

      cy.userSetPassword(validUser.username, validUser.password);

      // login as the new user
      cy.login(validUser);
      cy.url().should('eq', relative('/dashboard/deals/0'));

      // prove the lastLogin timestamp
      cy.login(AN_ADMIN);
      cy.url().should('eq', relative('/dashboard/deals/0'));
      header.users().click();

      users
        .row(validUser)
        .lastLogin()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.not.equal('');
        });
    });

    it('creates a new user with the trusted status', () => {
      validUser.roles.forEach((role) => {
        createUser.role(role).click();
      });

      cy.keyboardInput(createUser.username(), validUser.username);
      cy.keyboardInput(createUser.firstname(), validUser.firstname);
      cy.keyboardInput(createUser.surname(), validUser.surname);

      createUser.bank().select(validUser.bank);

      createUser.isTrustedTrue().click();

      createUser.createUser().click();

      cy.url().should('eq', relative('/admin/users/'));

      users.row(validUser).trusted().should('exist');
      cy.getUserByUsername(validUser.username).then(({ isTrusted }) => {
        expect(isTrusted).to.equal(true);
      });
    });

    it('should create a read-only user', () => {
      cy.keyboardInput(createUser.username(), validUser.username);
      cy.keyboardInput(createUser.firstname(), validUser.firstname);
      cy.keyboardInput(createUser.surname(), validUser.surname);

      createUser.bank().select(validUser.bank);

      createUser.role(READ_ONLY).click();
      createUser.createUser().click();

      cy.url().should('eq', relative('/admin/users/'));

      cy.assertText(users.row(validUser).roles(), READ_ONLY);
    });

    it('should create a new admin user with a UKEF email address.', () => {
      // Fill in all the fields
      cy.keyboardInput(createUser.firstname(), ukefEmailUser.firstname);
      cy.keyboardInput(createUser.surname(), ukefEmailUser.surname);
      createUser.isTrustedFalse().click();
      createUser.role(ADMIN).click();
      cy.keyboardInput(createUser.username(), ukefEmailUser.username);
      createUser.bank().select(ukefEmailUser.bank);

      // Create user
      createUser.createUser().click();

      // Assert URL
      cy.url().should('eq', relative('/admin/users/'));
      // Assert user existence
      cy.assertText(users.row(ukefEmailUser).roles(), ADMIN);
    });
  });
});
