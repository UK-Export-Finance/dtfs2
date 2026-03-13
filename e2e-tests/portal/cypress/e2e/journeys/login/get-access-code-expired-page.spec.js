const accessCodeExpired = require('../../pages/login/access-code-expired');
const { BANK1_MAKER1 } = require('../../../../../e2e-fixtures');

describe('Access Code Expired Page', () => {
  const { username } = BANK1_MAKER1;

  beforeEach(() => {
    // Ensure the user is in a clean state and has zero prior send count so they are not suspended
    cy.overridePortalUserSignInOTPSendCountByUsername({ username, count: 0 });
    cy.resetPortalUserStatusAndNumberOfSignInLinks(username);

    // Perform login to trigger sendSignInOTP which attempts to populate session values
    cy.enterUsernameAndPassword(BANK1_MAKER1);

    // Call the server endpoint that requests a new access code and stores attemptsLeft in session.
    // This ensures `numberOfSignInOtpAttemptsRemaining` exists before visiting the expired page.
    cy.request({ method: 'GET', url: '/login/request-new-access-code', followRedirect: true }).then(() => {
      cy.visit('/login/access-code-expired');
    });
  });

  it('renders the correct heading', () => {
    accessCodeExpired.heading().should('contain.text', 'Your access code has expired');
  });

  it('shows security info', () => {
    accessCodeExpired
      .securityInfo()
      .should('contain.text', 'For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.');
  });

  it('shows attempts remaining info', () => {
    accessCodeExpired.attemptsInfo().should('contain.text', 'attempts remaining');
  });

  it('shows suspend info', () => {
    accessCodeExpired
      .suspendInfo()
      .should(
        'contain.text',
        'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
      );
  });

  describe('Request new code button behaviour', () => {
    const scenarios = [
      { attemptsLeft: 2, expectedPath: '/login/check-your-email-access-code' },
      { attemptsLeft: 1, expectedPath: '/login/new-access-code' },
      { attemptsLeft: -1, expectedPath: '/login/temporarily-suspended-access-code' },
    ];

    scenarios.forEach(({ attemptsLeft: attempts, expectedPath }) => {
      it(`when attemptsLeft is ${attempts} it redirects to ${expectedPath} after clicking request new code`, () => {
        // compute DB signInOTPSendCount so that after increment the remaining attempts equals `attempts`
        // remaining = MAX_SIGN_IN_ATTEMPTS - (count + 1) => count = MAX_SIGN_IN_ATTEMPTS - 1 - remaining
        // with MAX_SIGN_IN_ATTEMPTS = 3, count = 2 - attempts
        const overrideCount = 2 - attempts;
        cy.overridePortalUserSignInOTPSendCountByUsername({ username, count: overrideCount });

        // visit the expired page; clicking the request button will call the server endpoint
        // to request a new access code (this is the single increment we want to test)
        cy.visit('/login/access-code-expired');

        accessCodeExpired.requestNewCodeButton().should('be.visible').and('contain.text', 'Request a new code');
        accessCodeExpired.requestNewCodeButton().click();
        cy.location('pathname').should('eq', expectedPath);
      });
    });
  });
});
