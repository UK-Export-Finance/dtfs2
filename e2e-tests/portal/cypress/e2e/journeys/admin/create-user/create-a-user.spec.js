const { header, users, createUser, changePassword } = require('../../../pages');
const relative = require('../../../relativeURL');
const {
  USER_ROLES: { MAKER, READ_ONLY, CHECKER, PAYMENT_REPORT_OFFICER },
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

  beforeEach(() => {
    cy.removeUserIfPresent(validUser, AN_ADMIN);
    cy.removeUserIfPresent(userWithInvalidPassword, AN_ADMIN);
  });

  it('Go to add user page and back', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);
    cy.url().should('include', '/dashboard/deals');
    header.users().click();

    // Go to add user's page
    users.addUser().click();
    cy.url().should('include', '/admin/users/create');

    // Back to the users page
    createUser.cancel().click();
    cy.url().should('include', '/admin/users');
  });

  it('should display validation text if fields are left empty', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);
    cy.url().should('include', '/dashboard/deals');
    header.users().click();

    // Go to add user's page
    users.addUser().click();
    cy.url().should('include', '/admin/users/create');

    // Click the create user button without filling in the fields
    createUser.createUser().click();

    // Check if the validation text is displayed for the first name, surname, roles, and bank fields
    createUser.firstNameError().should('contain', 'First name is required');
    createUser.surNameError().should('contain', 'Surname is required');
    createUser.rolesError().should('contain', 'At least one role is required');
  });

  it('Admin create user with empty fields', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);
    cy.url().should('include', '/dashboard/deals');
    header.users().click();

    // Go to add user's page
    users.addUser().click();
    cy.url().should('include', '/admin/users/create');

    // Add user
    createUser.createUser().click();

    // Empty input, should get re-directed to user create page
    cy.url().should('include', '/admin/users/create');
  });

  it('Admin user adds a new user and confirms the new user works once user sets password', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);

    header.users().click();
    users.user(validUser).should('not.exist');

    users.addUser().click();

    validUser.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(validUser.username);
    createUser.firstname().type(validUser.firstname);
    createUser.surname().type(validUser.surname);

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

  it('Admin user adds a new user. User tries to set invalid password, triggering validation error', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);

    header.users().click();
    users.user(userWithInvalidPassword).should('not.exist');

    users.addUser().click();

    userWithInvalidPassword.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(userWithInvalidPassword.username);
    createUser.firstname().type(userWithInvalidPassword.firstname);
    createUser.surname().type(userWithInvalidPassword.surname);
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

  it('creates a new user with the trusted status', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);

    header.users().click();
    users.user(validUser).should('not.exist');

    users.addUser().click();

    validUser.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(validUser.username);
    createUser.firstname().type(validUser.firstname);
    createUser.surname().type(validUser.surname);

    createUser.bank().select(validUser.bank);

    createUser.isTrustedTrue().click();

    createUser.createUser().click();

    cy.url().should('eq', relative('/admin/users/'));

    users.row(validUser).trusted().should('exist');
    cy.getUserByUsername(validUser.username).then(({ isTrusted }) => {
      expect(isTrusted).to.equal(true);
    });
  });

  it('Admin user adds a new user using "{ "$gt": "" }" as the email, triggering validation error', () => {
    // Login and go to the dashboard
    cy.login(AN_ADMIN);

    header.users().click();
    users.user(userWithInvalidPassword).should('not.exist');

    users.addUser().click();

    userWithInvalidPassword.roles.forEach((role) => {
      createUser.role(role).click();
    });

    // as the string has object characters, need to use parseSpecialCharSequences
    createUser.username().type(USER_WITH_INJECTION.username, { parseSpecialCharSequences: false });
    createUser.firstname().type(USER_WITH_INJECTION.firstname);
    createUser.surname().type(USER_WITH_INJECTION.surname);
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

  context('Admin user adding a read-only user', () => {
    beforeEach(() => {
      cy.login(AN_ADMIN);
      header.users().click();
      users.addUser().click();
    });

    it('should create a read-only user', () => {
      createUser.username().type(validUser.username);
      createUser.firstname().type(validUser.firstname);
      createUser.surname().type(validUser.surname);
      createUser.bank().select(validUser.bank);

      createUser.role(READ_ONLY).click();
      createUser.createUser().click();

      cy.url().should('eq', relative('/admin/users/'));
      users
        .row(validUser)
        .roles()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.equal(READ_ONLY);
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
  });
  // TODO: ADD lighthouse checks DTFS2-4994
});
