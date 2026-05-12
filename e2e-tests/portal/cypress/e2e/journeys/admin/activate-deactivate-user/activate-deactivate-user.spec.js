const {
  ROLES: { ADMIN: ADMIN_ROLE, MAKER },
} = require('@ukef/dtfs2-common');
const { header, users, createUser, editUser, landingPage } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { UKEF_BANK_1 } = require('../../../../../../e2e-fixtures/banks.fixture');

const { ADMIN: ADMIN_USER, BANK1_MAKER1 } = MOCK_USERS;
const PORTAL_2FA_FF = Cypress.env('FF_PORTAL_2FA_ENABLED');
const is2FAEnabled = PORTAL_2FA_FF === 'true';

context('Admin user updates an existing user', () => {
  const userToUpdate = {
    username: 'email@example.com',
    email: 'email@example.com',
    password: 'AbC!2345',
    firstname: 'first',
    surname: 'last',
    bank: UKEF_BANK_1,
    roles: [MAKER],
  };

  beforeEach(() => {
    cy.removeUserIfPresent(userToUpdate, ADMIN_USER);
  });

  if (!is2FAEnabled) {
    describe('when the 2FA feature flag is disabled', () => {
      /**
       * Verifies that an admin can create, deactivate, reactivate, and log in as another user in the non-2FA flow.
       */
      it('Create a user, then edit the user and change their role(s)', () => {
        // login and go to dashboard
        cy.login(ADMIN_USER);
        header.users().click();

        // add user
        users.addUser().click();
        userToUpdate.roles.forEach((role) => {
          createUser.role(role).click();
        });

        cy.keyboardInput(createUser.username(), userToUpdate.username);
        cy.keyboardInput(createUser.firstname(), userToUpdate.firstname);
        cy.keyboardInput(createUser.surname(), userToUpdate.surname);

        createUser.bank().select(userToUpdate.bank.id);
        createUser.createUser().click();

        cy.userSetPassword(userToUpdate.username, userToUpdate.password);

        // rely on existing 'create user' spec to prove default state

        // edit user +  de-activate
        users.visit();
        users.row(userToUpdate).username().click();
        editUser.Deactivate().click();
        editUser.save().click();

        cy.clearSessionCookies();

        // prove we can't log in as user
        landingPage.visit();
        cy.keyboardInput(landingPage.email(), userToUpdate.username);
        cy.keyboardInput(landingPage.password(), userToUpdate.password);
        cy.enterUsernameAndPassword(userToUpdate);
        cy.url().should('eq', relative('/login'));

        // go back to admin user and re-activate
        cy.login(ADMIN_USER);
        header.users().click();
        users.row(userToUpdate).username().click();
        editUser.Activate().click();
        editUser.save().click();

        // prove we can log in again
        cy.login(userToUpdate);
        cy.url().should('eq', relative('/dashboard/deals/0'));
      });
    });
  } else {
    describe('when the 2FA feature flag is enabled', () => {
      const adminUser = BANK1_MAKER1;
      const userToUpdate2FA = MOCK_USERS.BANK1_CHECKER1;

      beforeEach(() => {
        cy.removeUserIfPresent(userToUpdate2FA, ADMIN_USER);

        // Use a seeded user with a working local 2FA path for the admin UI steps.
        cy.task('updatePortalUserByUsername', {
          username: adminUser.username,
          update: {
            roles: [ADMIN_ROLE, MAKER],
          },
        });
      });

      afterEach(() => {
        cy.task('updatePortalUserByUsername', {
          username: adminUser.username,
          update: {
            roles: [MAKER],
          },
        });

        cy.removeUserIfPresent(userToUpdate2FA, ADMIN_USER);
      });

      /**
       * Verifies that an admin can create, deactivate, reactivate, and log in as another user in the 2FA flow.
       */
      it('Create a user, then edit the user and change their role(s)', () => {
        // login and go to dashboard
        cy.resetPortalUserStatusAndNumberOfSignInOTPs(adminUser.username);
        cy.login(adminUser);
        header.users().click();

        // add user
        users.addUser().click();
        userToUpdate2FA.roles.forEach((role) => {
          createUser.role(role).click();
        });

        cy.keyboardInput(createUser.username(), userToUpdate2FA.username);
        cy.keyboardInput(createUser.firstname(), userToUpdate2FA.firstname);
        cy.keyboardInput(createUser.surname(), userToUpdate2FA.surname);

        createUser.bank().select(userToUpdate2FA.bank.id);
        createUser.createUser().click();

        cy.userSetPassword(userToUpdate2FA.username, userToUpdate2FA.password);

        // edit user +  de-activate
        users.visit();
        users.row(userToUpdate2FA).username().click();
        editUser.Deactivate().click();
        editUser.save().click();

        cy.clearSessionCookies();

        // prove a deactivated user is sent to the suspended account page in the 2FA flow
        landingPage.visit();
        cy.keyboardInput(landingPage.email(), userToUpdate2FA.username);
        cy.keyboardInput(landingPage.password(), userToUpdate2FA.password);
        cy.enterUsernameAndPassword(userToUpdate2FA);
        cy.url().should('eq', relative('/login/temporarily-suspended-access-code'));

        // go back to admin user and re-activate
        cy.login(adminUser);
        header.users().click();
        users.row(userToUpdate2FA).username().click();
        editUser.Activate().click();
        editUser.save().click();

        cy.clearSessionCookies();

        // prove we can log in again using the 2FA flow
        cy.login(userToUpdate2FA);
        cy.url().should('eq', relative('/dashboard/deals/0'));
      });
    });
  }
});
