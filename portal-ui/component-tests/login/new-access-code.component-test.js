const pageRenderer = require('../pageRenderer');
const { withContactUsEmailAddressTests } = require('../test-helpers/with-contact-us-email-address.component-tests');

const page = 'login/new-access-code.njk';
const render = pageRenderer(page);

describe(page, () => {
  const email = 'user@example.com';
  const attemptsRemaining = 2;
  let wrapper;

  beforeEach(() => {
    wrapper = render({ email, attemptsRemaining });
  });

  withContactUsEmailAddressTests({ page });

  it('should render the heading', () => {
    wrapper.expectText('[data-cy="new-access-code-email-sent-heading"]').toRead('New access code sent');
  });

  it('should render the description paragraph with email', () => {
    wrapper.expectText('[data-cy="new-access-code-email-sent-description"]').toRead(`We've sent you a 6-digit access code to your email ${email}.`);
  });

  it('should render the access code input', () => {
    const input = wrapper.expectInput('[data-cy="access-code-input"]');
    expect(input).toBeDefined();
  });

  it('should render the label for the access code input', () => {
    wrapper.expectText('label[for="accessCode"]').toRead('Enter access code:');
  });

  it('should render the expiry info paragraph', () => {
    wrapper
      .expectText('[data-cy="new-access-code-email-sent-expiry-info"]')
      .toRead("We've sent you a new email with a different access code to sign in. This code will expire after 30 minutes.");
  });

  it('should render the spam or junk info paragraph', () => {
    wrapper
      .expectText('[data-cy="access-code-spam-or-junk"]')
      .toRead('Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');
  });

  it('should not render the support info paragraph', () => {
    wrapper.expectElement('[data-cy="access-code-support-info"]').notToExist();
  });

  it('should render the attempts remaining paragraph', () => {
    wrapper.expectText('[data-cy="access-code-attempts-info"]').toRead(`You have ${attemptsRemaining} attempts remaining.`);
  });

  it('should render the suspend info paragraph', () => {
    wrapper
      .expectText('[data-cy="access-code-suspend-info"]')
      .toRead('If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.');
  });

  it('should render the sign in button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Sign in');
  });

  it('should render the request code link', () => {
    wrapper.expectElement('[data-cy="request-code-link"]').hasClass('govuk-link');
    wrapper.expectElement('[data-cy="request-code-link"]').toContain('Request a new code');
  });
});
