const pageRenderer = require('../pageRenderer');
const { withContactUsEmailAddressTests } = require('../test-helpers/with-contact-us-email-address.component-tests');

const page = 'login/resend-another-access-code.njk';
const render = pageRenderer(page);

describe(page, () => {
  const email = 'user@example.com';
  const attemptsLeft = 0;
  const isSupportInfo = true;
  const requestNewCodeUrl = '/request-new-code';
  const isAccessCodeLink = false;
  let wrapper;

  beforeEach(() => {
    wrapper = render({ email, isSupportInfo, attemptsLeft, requestNewCodeUrl, isAccessCodeLink });
  });

  withContactUsEmailAddressTests({ page });

  it('should render the heading', () => {
    wrapper.expectText('[data-cy="resend-another-access-code-email-sent-heading"]').toRead("We've sent you another access code");
  });

  it('should render the description paragraph with email', () => {
    wrapper.expectText('[data-cy="resend-another-access-code-email-sent-description"]').toRead(`We've sent you another email with a access code to ${email}`);
  });

  it('should render the access code input', () => {
    wrapper.expectElement('[data-cy="access-code-input"]').toExist();
  });

  it('should render the access code input with placeholder', () => {
    wrapper.expectElement('[data-cy="access-code-input"]').toHaveAttribute('placeholder', 'e.g. 123456');
  });

  it('should render the access code input with the correct class', () => {
    wrapper.expectElement('[data-cy="access-code-input"]').hasClass('govuk-input--width-10');
  });

  it('should render the label for the access code input', () => {
    wrapper.expectText('label[for="sixDigitAccessCode"]').toRead('Enter access code:');
  });

  it('should render the expiry info paragraph', () => {
    wrapper
      .expectText('[data-cy="resend-another-access-code-email-sent-expiry-info"]')
      .toRead('This code will expire after 30 minutes. Any previous access codes we have sent will no longer be valid.');
  });

  it('should render the spam or junk info paragraph', () => {
    wrapper
      .expectText('[data-cy="access-code-spam-or-junk"]')
      .toRead('Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');
  });

  it('should render the support info paragraph', () => {
    wrapper
      .expectText('[data-cy="resend-another-access-code-email-sent-expiry-info"]')
      .toRead('This code will expire after 30 minutes. Any previous access codes we have sent will no longer be valid.');
  });

  it('should render the attempts remaining paragraph', () => {
    wrapper.expectText('[data-cy="access-code-attempts-info"]').toRead(`You have ${attemptsLeft} attempts remaining.`);
  });

  it('should render the suspend info paragraph', () => {
    wrapper
      .expectText('[data-cy="access-code-suspend-info"]')
      .toRead('If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.');
  });

  it('should render the sign in button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Sign in');
  });
});
