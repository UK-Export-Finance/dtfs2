const componentRenderer = require('../../componentRenderer');

const component = 'login/_macros/access-code-attempts.njk';
const render = componentRenderer(component);

describe(component, () => {
  const params = {
    isSupportInfo: true,
    attemptsLeft: 3,
    requestNewCodeUrl: '/request-new-code',
    isAccessCodeLink: true,
  };

  it('should render all access code info sign in button and access code link', () => {
    const wrapper = render(params);

    wrapper.expectElement('[data-cy="access-code-spam-or-junk"]').hasClass('govuk-body');
    wrapper
      .expectElement('[data-cy="access-code-spam-or-junk"]')
      .toContain('Please check your spam or junk folders and be aware emails may sometimes take a few minutes to arrive.');

    wrapper.expectElement('[data-cy="access-code-support-info"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="access-code-support-info"]').toContain('If you are still having problems signing in, contact us for support.');

    wrapper.expectElement('[data-cy="access-code-attempts-info"]').hasClass('govuk-body');
    wrapper.expectElement('[data-cy="access-code-attempts-info"]').toContain('You have 3 attempts remaining.');

    wrapper.expectElement('[data-cy="access-code-suspend-info"]').hasClass('govuk-body');
    wrapper
      .expectElement('[data-cy="access-code-suspend-info"]')
      .toContain('If you request too many access codes your account will be suspended for security purposes and you will be prompted to contact us.');

    wrapper.expectElement('[data-cy="submit-button"]').toContain('Sign in');

    wrapper.expectElement('[data-cy="request-code-link"]').hasClass('govuk-link');
    wrapper.expectElement('[data-cy="request-code-link"]').toContain('Request a new code');
  });

  it('should not render support info or request code link when flags are false', () => {
    const wrapper = render({ ...params, isSupportInfo: false, isAccessCodeLink: false });

    wrapper.expectElement('[data-cy="access-code-support-info"]').notToExist();
    wrapper.expectElement('[data-cy="request-code-link"]').notToExist();
  });
});
