const pageRenderer = require('../pageRenderer');

const page = 'login/new-sign-in-link-sent.njk';
const render = pageRenderer(page);

describe(page, () => {
  const csrfToken = 'a csrf token';
  let wrapper;

  beforeEach(() => {
    wrapper = render({ csrfToken });
  });

  it('should render link to request a new sign in link', () => {
    wrapper.expectText('[data-cy="request-new-sign-in-link"]').toRead('Request a new sign in link');
  });

  it('should render a hidden input with the csrf token', () => {
    const expectCsrfInput = wrapper.expectInput('[data-cy="csrf-input"]');
    expectCsrfInput.toHaveValue(csrfToken);
    expectCsrfInput.toBeHidden();
  });
});
