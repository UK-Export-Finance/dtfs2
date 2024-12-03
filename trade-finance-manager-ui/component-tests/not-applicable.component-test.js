const { componentRenderer } = require('./componentRenderer');

const component = '../templates/_macros/not-applicable.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = { id: 'test' };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render text', () => {
    const selector = `[data-cy="${params.id}-not-applicable"]`;

    wrapper.expectText(selector).toRead('Not applicable');
  });
});
