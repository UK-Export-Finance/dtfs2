const pageRenderer = require('../pageRenderer');

const page = 'login/access-code-expired.njk';
const render = pageRenderer(page);

describe(page, () => {
  const attemptsLeft = 2;
  let wrapper;

  beforeEach(() => {
    wrapper = render({ attemptsLeft });
  });

  it('should render the heading', () => {
    wrapper.expectText('[data-cy="access-code-expired-heading"]').toRead('Your access code has expired');
  });

  it('should render the security info paragraph', () => {
    wrapper
      .expectText('[data-cy="access-code-expired-security-info"]')
      .toRead('For security, access codes expire after 30 minutes. You can request for a new access code to be sent to your email address.');
  });

  it('should render the attempts remaining paragraph', () => {
    wrapper.expectText('[data-cy="access-code-expired-attempts-info"]').toRead(`You have ${attemptsLeft} attempts remaining.`);
  });

  it('should render the suspend info paragraph', () => {
    wrapper
      .expectText('[data-cy="access-code-expired-suspend-info"]')
      .toRead('If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.');
  });

  it('should render the request new code button', () => {
    wrapper.expectText('[data-cy="submit-button"]').toRead('Request a new code');
  });
});
