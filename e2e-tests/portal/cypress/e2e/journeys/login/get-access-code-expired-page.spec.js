import accessCodeExpired from '../../pages/login/access-code-expired';

context('Access Code Expired Page', () => {
  const attemptsLeft = 2;
  const userId = 'test-user-123';

  beforeEach(() => {
    // TODO: session not avaible yet as the endpoint to set up session data is not implemented yet. Once implemented, this will set up the session with the specified user ID and attempts left before visiting the page.
    cy.setupPortalSession({
      userId,
      numberOfSignInOtpAttemptsRemaining: attemptsLeft,
    });
    cy.visit('/login/access-code-expired');
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
    accessCodeExpired.attemptsInfo().should('contain.text', `You have ${attemptsLeft} attempts remaining.`);
  });

  it('shows suspend info', () => {
    accessCodeExpired
      .suspendInfo()
      .should(
        'contain.text',
        'If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.',
      );
  });

  it('shows and clicks the request new code button', () => {
    accessCodeExpired.requestNewCodeButton().should('be.visible').and('contain.text', 'Request a new code');
    accessCodeExpired.clickRequestNewCode();
    // TODO: once the endpoint to set up session data is implemented, we can assert that the user is redirected to the new access code page after clicking the button. For now, we can just assert that the URL changes to the expected path.
    cy.location('pathname').should('eq', '/login/new-access-code');
  });
});
