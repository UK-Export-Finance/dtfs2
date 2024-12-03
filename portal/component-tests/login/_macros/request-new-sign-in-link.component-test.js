const componentRenderer = require('../../componentRenderer');

const component = 'login/_macros/request-new-sign-in-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const isPrimaryActionOnPage = true;
  const csrfToken = 'a csrf token';

  it('styles the request new sign in link button as a button if it is the primary action on the page', () => {
    const wrapper = render({ isPrimaryActionOnPage: true, csrfToken });
    wrapper.expectElement('[data-cy="request-new-sign-in-link"]').hasClass('govuk-button');
  });

  it('styles the request new sign in link button as a link if it is not the primary action on the page', () => {
    const wrapper = render({ isPrimaryActionOnPage: false, csrfToken });
    wrapper.expectElement('[data-cy="request-new-sign-in-link"]').hasClass('button-as-link');
  });

  it('has a hidden input with the csrf token', () => {
    const wrapper = render({ isPrimaryActionOnPage, csrfToken });

    const expectCsrfInput = wrapper.expectInput('[data-cy="csrf-input"]');
    expectCsrfInput.toHaveValue(csrfToken);
    expectCsrfInput.toBeHidden();
  });
});
