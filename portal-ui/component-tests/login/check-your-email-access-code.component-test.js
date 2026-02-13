const pageRenderer = require('../pageRenderer');

const page = 'login/check-your-email-access-code.njk';
const render = pageRenderer(page);

describe(page, () => {
  const email = 'test@example.com';
  const attemptsLeft = 2;
  const requestNewCodeUrl = '/request-new-code';

  describe('when there are no validation errors', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render({ email, attemptsLeft, requestNewCodeUrl });
    });

    it('should render the page title without error prefix', () => {
      wrapper.expectPageTitle().toRead('Check your email');
    });

    it('should not render the error summary', () => {
      wrapper.expectElement('[data-cy="error-summary"]').notToExist();
    });

    it('should render the heading', () => {
      wrapper.expectText('[data-cy="check-your-email-heading"]').toRead('Check your email');
    });

    it('should render the description paragraph with email', () => {
      wrapper.expectText('[data-cy="check-your-email-description"]').toRead(`We have sent you a 6-digit access code to your email ${email}.`);
    });

    it('should render the access code input', () => {
      const input = wrapper.expectInput('[data-cy="six-digit-access-code-input"]');
      expect(input).toBeDefined();
    });

    it('should render the label for the access code input', () => {
      wrapper.expectText('label[for="signInOTP"]').toRead('Enter access code:');
    });

    it('should not render inline error message for access code input', () => {
      wrapper.expectElement('[data-cy="six-digit-access-code-inline-error"]').notToExist();
    });

    it('should render the expiry info paragraph', () => {
      wrapper.expectText('[data-cy="access-code-expiry-info"]').toRead('This code will expire after 30 minutes.');
    });

    it('should render the spam/junk info paragraph', () => {
      wrapper.expectElement('[data-cy="access-code-spam-or-junk"]').hasClass('govuk-body');
      wrapper
        .expectElement('[data-cy="access-code-spam-or-junk"]')
        .toContain('Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');
    });

    it('should not render the support info paragraph', () => {
      wrapper.expectElement('[data-cy="access-code-support-info"]').notToExist();
    });

    it('should render the attempts remaining paragraph', () => {
      wrapper.expectElement('[data-cy="access-code-attempts-info"]').toContain('You have 2 attempts remaining.');
    });

    it('should render the suspend info paragraph', () => {
      wrapper.expectElement('[data-cy="access-code-suspend-info"]').hasClass('govuk-body');
      wrapper
        .expectElement('[data-cy="access-code-suspend-info"]')
        .toContain('If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.');
    });

    it('should render the sign in button', () => {
      wrapper.expectElement('[data-cy="submit-button"]').toContain('Sign in');
    });

    it('should render the request code link', () => {
      wrapper.expectElement('[data-cy="request-code-link"]').hasClass('govuk-link');
      wrapper.expectElement('[data-cy="request-code-link"]').toContain('Request a new code');
    });
  });

  describe('when there are validation errors', () => {
    let wrapper;
    const validationErrors = {
      signInOTP: {
        text: 'Enter the access code',
        href: '#signInOTP',
      },
    };

    beforeEach(() => {
      wrapper = render({ email, attemptsLeft, requestNewCodeUrl, validationErrors });
    });

    it('should render the page title with error prefix', () => {
      wrapper.expectPageTitle().toRead('Error: Check your email');
    });

    it('should render the error summary', () => {
      wrapper.expectElement('[data-cy="error-summary"]').toExist();
      wrapper.expectText('[data-cy="error-summary"] h2').toRead('There is a problem');
    });

    it('should render the error summary with correct link', () => {
      wrapper.expectLink('[data-cy="error-summary"] a').toLinkTo('#signInOTP', 'Enter the access code');
    });

    it('should render inline error message for access code input', () => {
      wrapper.expectElement('[data-cy="six-digit-access-code-inline-error"]').toExist();
      wrapper.expectElement('[data-cy="six-digit-access-code-inline-error"]').toContain('Enter the access code');
    });

    it('should render the access code input with error styling', () => {
      wrapper.expectElement('#signInOTP').hasClass('govuk-input--error');
    });

    it('should render the form group with error styling', () => {
      wrapper.expectElement('.govuk-form-group').hasClass('govuk-form-group--error');
    });
  });
});
