const { componentRenderer } = require('../componentRenderer');

const component = '_macros/success-banner.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const message = 'test message';

  beforeEach(() => {
    wrapper = render(message);
  });

  it('should exist', () => {
    wrapper.expectElement('[data-cy="success-banner"]').toExist();
  });

  it('should render the success banner containing the message', () => {
    wrapper.expectText('[data-cy="success-banner"]').toRead(message);
  });

  it('should render the success banner containing the message, with the correct class', () => {
    wrapper.expectElement('[data-cy="success-banner"]').hasClass('govuk-!-margin-top-7');
  });
});
