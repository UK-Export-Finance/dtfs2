const { startNow, users, createUser} = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );

context('Admin user creates a new user', () => {
  const validUser = {
    username: 'an.address@some.com',
    password: 'Aleg1tP@ssword',
    firstname: 'bob',
    surname: 'builder',
    bank: 'HSBC',
    roles: ['maker'],
  };

  const userWithInvalidPassword = {
    username: 'another.address@some.com',
    password: 'aaa',
    firstname: 'alfred',
    surname: 'd. great',
    bank: 'HSBC',
    roles: ['maker'],
  };

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.removeUserIfPresent(validUser, ADMIN_LOGIN);
    cy.removeUserIfPresent(userWithInvalidPassword, ADMIN_LOGIN);
  });

  it('Admin user adds a new user and confirms the new user works', () => {
    // login and go to dashboard
    cy.login(ADMIN_LOGIN);

    startNow.header().users().click();
    users.user(validUser).should('not', 'exist');

    users.addUser().click();

    for (const role of validUser.roles) {
      createUser.role(role).click();
    }
    createUser.username().type(validUser.username);
    createUser.password().type(validUser.password);
    createUser.confirmPassword().type(validUser.password);
    createUser.firstname().type(validUser.firstname);
    createUser.surname().type(validUser.surname);

    createUser.bank().select(validUser.bank);

    createUser.createUser().click();

    cy.url().should('eq', relative('/admin/users/'));
    users.user(validUser).should('exist');


    // login as the new user
    cy.login(validUser);
    cy.url().should('eq', relative('/start-now'));

    // prove the lastLogin timestamp
    cy.login(ADMIN_LOGIN);
    cy.url().should('eq', relative('/start-now'));
    startNow.header().users().click();

    users.row(validUser).lastLogin().invoke('text').then((text) => {
      expect(text.trim()).to.not.equal('');
    });

  });

  it('Admin user adds a new user, triggering validation errors', () => {
    // login and go to dashboard
    cy.login(ADMIN_LOGIN);

    startNow.header().users().click();
    users.user(userWithInvalidPassword).should('not', 'exist');

    users.addUser().click();

    for (const role of userWithInvalidPassword.roles) {
      createUser.role(role).click();
    }
    createUser.username().type(userWithInvalidPassword.username);
    createUser.password().type(userWithInvalidPassword.password);
    createUser.confirmPassword().type(userWithInvalidPassword.password);
    createUser.firstname().type(userWithInvalidPassword.firstname);
    createUser.surname().type(userWithInvalidPassword.surname);
    createUser.bank().select(userWithInvalidPassword.bank);

    createUser.createUser().click();

    cy.url().should('eq', relative('/admin/users/create'));

    createUser.passwordError().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character.');
    });

  });

  xit("Manage users screen should pass Lighthouse audit", function () {
    // login and go to manage users
    cy.login(ADMIN_LOGIN);
    startNow.header().users().click();

    cy.lighthouse({
      performance: 85,
      accessibility: 100,
      "best-practices": 85,
      seo: 85,
      pwa: 100,
    });
    cy.pa11y();
  });

  xit("Add user screen should pass Lighthouse audit", function () {
    // login and go to add/edit user
    cy.login(ADMIN_LOGIN);
    startNow.header().users().click();
    users.addUser().click();

    cy.lighthouse({
      performance: 85,
      accessibility: 100,
      "best-practices": 85,
      seo: 85,
      pwa: 100,
    });
    cy.pa11y();
  });

});
