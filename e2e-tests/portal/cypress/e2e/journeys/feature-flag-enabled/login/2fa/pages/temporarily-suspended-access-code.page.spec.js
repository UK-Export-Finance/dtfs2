const relative = require('../../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../../e2e-fixtures');

const { BANK1_MAKER1 } = MOCK_USERS;
const { commonBeforeEach } = require('./2faPageHelpers');
const { temporarilySuspendedAccessCode } = require('../../../../../pages');

context('2FA Page - Temporarily suspended account', () => {
  beforeEach(() => {
    commonBeforeEach(BANK1_MAKER1, { login: false });
    /**
     * initializing the OTP send count to 3 so in the below tests when the user logs in and an OTP is sent, the count
     * becomes 4 and attemptsLeft becomes -1, which allows us to land on the temporarily-suspended-access-code
     * page and test its page elements.
     */
    cy.overridePortalUserSignInOTPSendCountByUsername({ username: BANK1_MAKER1.username, count: 3 });
  });

  it('should redirect to login when visited without partial auth', () => {
    temporarilySuspendedAccessCode.visit();
    cy.url().should('eq', relative('/login'));
  });

  it('should render temporarily suspended page with heading and message', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    temporarilySuspendedAccessCode.heading().should('exist');
    temporarilySuspendedAccessCode.message().should('contain', 'failed attempts');
  });

  it('should render contact us section', () => {
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    cy.get('[data-cy="contact-us-email"]')
      .should('have.attr', 'href')
      .and('match', /^mailto:/);
    cy.get('[data-cy="contact-us-timeframe"]').should('exist');
  });
});
