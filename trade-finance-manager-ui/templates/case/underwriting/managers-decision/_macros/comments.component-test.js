const componentRenderer = require('../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/managers-decision/_macros/comments.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    id: 'testing',
    label: 'Test comments',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render character count label with params id', () => {
    const selector = `[data-cy="${params.id}-comments-input-label"]`;

    wrapper.expectElement(selector).toExist();
    wrapper.expectText(selector).toRead(params.label);
  });

  it('should render character count input with params id', () => {
    const selector = `[data-cy="${params.id}-comments-input"]`;

    wrapper.expectElement(selector).toExist();
  });
});
