const componentRenderer = require('../../componentRenderer');

const component = 'login/_macros/request-new-sign-in-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  it('styles the request new sign in link button as a button if it is the primary action on the page', () => {
    const wrapper = render({ isPrimaryActionOnPage: true });
    wrapper.expectElement('[data-cy="request-new-sign-in-link"]')
      .hasClass('govuk-button');
  });

  it('styles the request new sign in link button as a link if it is not the primary action on the page', () => {
    const wrapper = render({ isPrimaryActionOnPage: false });
    wrapper.expectElement('[data-cy="request-new-sign-in-link"]')
      .hasClass('button-as-link govuk-!-font-size-19');
  });
});
