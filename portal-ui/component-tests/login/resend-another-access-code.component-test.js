const pageRenderer = require('../pageRenderer');
const { withContactUsEmailAddressTests } = require('../test-helpers/with-contact-us-email-address.component-tests');

const page = 'login/resend-another-access-code.njk';
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
    wrapper.expectText('[data-cy="resend-another-access-code-email-sent-heading"]').toRead("We've sent you another access code");
  });

  it('should render the description paragraph with email', () => {
    wrapper.expectText('[data-cy="resend-access-code-email-sent-description"]').toRead(`We've sent you another email with a access code to ${email}`);
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
      .expectText('[data-cy="resend-another-access-code-email-sent-expiry-info"]')
      .toRead('This code will expire after 30 minutes. Any previous access codes we have sent will no longer be valid.');
  });

  it('should render the spam or junk info paragraph', () => {
    wrapper
      .expectText('[data-cy="resend-another-access-code-spam-or-junk"]')
      .toRead('Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');
  });

  it('should render the support info paragraph', () => {
    wrapper.expectText('[data-cy="resend-another-access-code-support-info"]').toRead('If you are still having problems signing in, contact us for support.');
  });

  it('should render the attempts remaining paragraph', () => {
    wrapper.expectText('[data-cy="resend-another-access-code-attempts-info"]').toRead(`You have ${attemptsRemaining} attempts remaining.`);
  });

  it('should render the suspend info paragraph', () => {
    wrapper
      .expectText('[data-cy="resend-another-access-code-suspend-info"]')
      .toRead('If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.');
  });

  it('should render the sign in button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Sign in');
  });
});
