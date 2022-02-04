const { header, users, createUser } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');

const { ADMIN } = MOCK_USERS;

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
    cy.removeUserIfPresent(validUser, ADMIN);
    cy.removeUserIfPresent(userWithInvalidPassword, ADMIN);
  });

  it('Admin user adds a new user and confirms the new user works', () => {
    // login and go to dashboard
    cy.login(ADMIN);

    header.users().click();
    users.user(validUser).should('not.exist');

    users.addUser().click();

    validUser.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(validUser.username);
    createUser.manualPassword().click();
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
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // prove the lastLogin timestamp
    cy.login(ADMIN);
    cy.url().should('eq', relative('/dashboard/deals/0'));
    header.users().click();

    users.row(validUser).lastLogin().invoke('text').then((text) => {
      expect(text.trim()).to.not.equal('');
    });
  });

  it('Admin user adds a new user, triggering validation errors', () => {
    // login and go to dashboard
    cy.login(ADMIN);

    header.users().click();
    users.user(userWithInvalidPassword).should('not.exist');

    users.addUser().click();

    userWithInvalidPassword.roles.forEach((role) => {
      createUser.role(role).click();
    });
    createUser.username().type(userWithInvalidPassword.username);
    createUser.manualPassword().click();
    createUser.password().type(userWithInvalidPassword.password);
    createUser.confirmPassword().type(userWithInvalidPassword.password);
    createUser.firstname().type(userWithInvalidPassword.firstname);
    createUser.surname().type(userWithInvalidPassword.surname);
    createUser.bank().select(userWithInvalidPassword.bank);

    createUser.createUser().click();

    cy.url().should('eq', relative('/admin/users/create'));

    createUser.passwordError().invoke('text').then((text) => {
      expect(text.trim()).to.contain('Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.');
    });
  });

  // TODO: ADD lighthouse checks DTFS2-4994
  //   it('Manage users screen should pass Lighthouse audit', () => {
  //     // login and go to manage users
  //     cy.login(ADMIN);
  //     header.users().click();

  //     cy.lighthouse({
  //       performance: 80,
  //       accessibility: 100,
  //       'best-practices': 85,
  //       seo: 85,
  //       pwa: 100,
  //     });
  //     cy.pa11y();
  //   });

  // TODO: ADD lighthouse checks DTFS2-4994
  //   it('Add user screen should pass Lighthouse audit', () => {
  //     // login and go to add/edit user
  //     cy.login(ADMIN);
  //     header.users().click();
  //     users.addUser().click();

//     cy.lighthouse({
//       performance: 85,
//       accessibility: 100,
//       'best-practices': 85,
//       seo: 85,
//       pwa: 100,
//     });
//     cy.pa11y();
//   });
});
