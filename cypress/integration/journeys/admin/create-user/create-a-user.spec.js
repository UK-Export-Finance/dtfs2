const { startNow, users, createUser} = require('../../../pages');
const relative = require('../../../relativeURL');

const mockUsers = require('../../../../fixtures/mockUsers');
const ADMIN_LOGIN = mockUsers.find( user=> (user.roles.includes('admin')) );

context('Admin user creates a new user', () => {
  const userToCreate = {
    username: 'an.address@some.com',
    password: 'Aleg1tP@ssword',
    firstname: 'bob',
    surname: 'builder',
    bank: 'HSBC',
    roles: ['maker'],
  }

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });

    cy.removeUserIfPresent(userToCreate, ADMIN_LOGIN);
  });

  it('Admin user adds a new user and confirms the new user works', () => {
    // login and go to dashboard
    cy.login(ADMIN_LOGIN);

    startNow.header().users().click();
    users.user(userToCreate).should('not', 'exist');

    users.addUser().click();

    for (const role of userToCreate.roles) {
      createUser.role(role).click();
    }
    createUser.username().type(userToCreate.username);
    createUser.password().type(userToCreate.password);
    createUser.confirmPassword().type(userToCreate.password);
    createUser.firstname().type(userToCreate.firstname);
    createUser.surname().type(userToCreate.surname);

    createUser.bank().select(userToCreate.bank);

    createUser.createUser().click();

    cy.url().should('eq', relative('/admin/users/'));
    users.user(userToCreate).should('exist');


    // login as the new user
    cy.login(userToCreate);
    cy.url().should('eq', relative('/start-now'));

    // prove the lastLogin timestamp
    cy.login(ADMIN_LOGIN);
    cy.url().should('eq', relative('/start-now'));
    startNow.header().users().click();

    users.row(userToCreate).lastLogin().invoke('text').then((text) => {
      expect(text.trim()).to.not.equal('');
    });

  });

  it("Manage users screen should pass Lighthouse audit", function () {
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

  it("Add user screen should pass Lighthouse audit", function () {
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
