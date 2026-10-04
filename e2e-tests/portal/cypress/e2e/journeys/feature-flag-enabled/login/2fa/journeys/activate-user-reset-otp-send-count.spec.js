const { header, users, editUser, checkYourEmailAccessCode } = require('../../../../../pages');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');
const relative = require('../../../../../relativeURL');

const { BANK1_MAKER1 } = MOCK_USERS;

const { ADMIN } = MOCK_USERS;

context('Admin re-activating a user should reset the sign-in OTP send count', () => {
  beforeEach(() => {
    cy.task('updatePortalUserByUsername', {
      username: BANK1_MAKER1.username,
      update: { 'user-status': 'active', signInOTPSendCount: 3 },
    });

    cy.enterUsernameAndPassword(BANK1_MAKER1);
  });

  it('should show the correct remaining OTP attempts after re-activating a user', () => {
    // reactivate the user
    cy.login(ADMIN);
    header.users().click();

    users.row(BANK1_MAKER1).username().click();
    editUser.Activate().click();
    editUser.save().click();

    cy.clearSessionCookies();

    // log back in as the user
    cy.enterUsernameAndPassword(BANK1_MAKER1);
    cy.url().should('eq', relative('/login/check-your-email-access-code'));
    cy.assertText(checkYourEmailAccessCode.attemptsInfo(), 'You have 2 attempts remaining.');
  });
});
