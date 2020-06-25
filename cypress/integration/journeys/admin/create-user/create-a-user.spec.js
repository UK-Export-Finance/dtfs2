const { startNow, users, createUser} = require('../../../pages');
const relative = require('../../../relativeURL');

const admin = { username: 'ADMIN', password: 'ADMIN' };

context('Admin user creates a new user', () => {
  const userToCreate = {
    username: 'an.address@some.com',
    password: 'w00t',
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

    cy.removeUserIfPresent(userToCreate, admin);
  });

  it('Admin user adds a new user and confirms the new user works', () => {
    // login and go to dashboard
    cy.login(admin);

    startNow.header().manageUsers().click();
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

  });
});
