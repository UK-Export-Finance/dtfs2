const { componentRenderer } = require('../componentRenderer');

const component = '_macros/success-banner.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const message = 'test message';

  beforeEach(() => {
    wrapper = render(message);
  });

  it('should render the success banner containing the message', () => {
    wrapper.expectText('[data-cy="success-banner"]').toRead(message);
  });
});
