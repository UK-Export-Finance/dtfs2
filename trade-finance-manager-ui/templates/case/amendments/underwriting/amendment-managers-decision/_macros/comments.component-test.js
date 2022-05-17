const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/managers-decision/_macros/comments.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    id: 'testing',
    label: 'Test comments',
  };

  it('should render character count label with params id', () => {
    wrapper = render(params);

    const selector = `[data-cy="${params.id}-input-label"]`;

    wrapper.expectElement(selector).toExist();
    wrapper.expectText(selector).toRead(params.label);
  });

  it('should render character count input with params id', () => {
    wrapper = render(params);

    const selector = `[data-cy="${params.id}-input"]`;

    wrapper.expectElement(selector).toExist();
  });

  it('should render validation error', () => {
    params = {
      ...params,
      validationError: {
        text: 'This is required',
      },
    };

    wrapper = render(params);

    const selector = `[data-cy="${params.id}-input-error"]`;

    wrapper.expectElement(selector).toExist();

    const expected = `Error: ${params.validationError.text}`;

    wrapper.expectText(selector).toRead(expected);
  });
});
