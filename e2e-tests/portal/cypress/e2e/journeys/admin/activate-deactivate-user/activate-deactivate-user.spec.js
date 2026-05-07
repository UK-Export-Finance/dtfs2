const {
  ROLES: { ADMIN: ADMIN_ROLE, MAKER },
} = require('@ukef/dtfs2-common');
const { logIn: loginViaApi } = require('../../../../support/portal-api/api');
const { header, users, createUser, editUser, landingPage, temporarilySuspendedAccessCode } = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { UKEF_BANK_1 } = require('../../../../../../e2e-fixtures/banks.fixture');

const { ADMIN, BANK1_MAKER1 } = MOCK_USERS;
const PORTAL_2FA_FF = Cypress.env('FF_PORTAL_2FA_ENABLED');

context('Admin user updates an existing user', () => {
  const adminUser = BANK1_MAKER1;

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
    cy.removeUserIfPresent(userToUpdate, ADMIN);

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
  });

  it('Create a user, then edit the user and change their role(s)', () => {
    // login and go to dashboard
    cy.resetPortalUserStatusAndNumberOfSignInOTPs(adminUser.username);
    cy.login(adminUser);
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

    // A deactivated user is shown the suspended account page neither using 2FA flow nor the non-2FA flow, depending on the state of the 2FA feature flag.
    landingPage.visit();
    cy.keyboardInput(landingPage.email(), userToUpdate.username);
    cy.keyboardInput(landingPage.password(), userToUpdate.password);
    cy.enterUsernameAndPassword(userToUpdate);

    if (PORTAL_2FA_FF === 'true') {
      cy.url().should('eq', relative('/login/temporarily-suspended-access-code'));

      cy.assertText(temporarilySuspendedAccessCode.heading(), 'This account has been temporarily suspended');
      cy.assertText(
        temporarilySuspendedAccessCode.message(),
        'This can happen if there are too many failed attempts to login or sign in link requests. Check your email for details on how to regain access.',
      );
    } else {
      cy.url().should('eq', relative('/login'));
      cy.assertText(cy.get('[data-cy="account-suspended"]'), 'This account has been temporarily suspended');
      cy.contains('This can happen if there are too many failed attempts to login or sign in link requests.');
    }

    // go back to admin user and re-activate
    cy.resetPortalUserStatusAndNumberOfSignInOTPs(adminUser.username);
    cy.login(adminUser);
    header.users().click();
    users.row(userToUpdate).username().click();
    editUser.Activate().click();
    editUser.save().click();

    // Reset OTP state after the blocked login attempt before re-testing login.
    cy.resetPortalUserStatusAndNumberOfSignInOTPs(userToUpdate.username);

    // Prove the user can authenticate again after re-activation without relying
    // on local OTP email delivery for the synthetic `email@example.com` address.
    loginViaApi(userToUpdate).then((token) => {
      // Use an explicit boolean assertion here because `expect(token).to.exist`
      // is flagged by lint as an unused expression in this test file.
      expect(Boolean(token)).to.equal(true);
    });
  });
});
