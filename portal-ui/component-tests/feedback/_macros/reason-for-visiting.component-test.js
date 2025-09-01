const componentRenderer = require('../../componentRenderer');

const component = 'feedback/_macros/reason-for-visiting-other.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const value = 'testing';
  const validationError = {
    text: 'Reason for visiting other error message',
  };

  beforeEach(() => {
    wrapper = render({
      value,
      validationError,
    });
  });

  it('should render text input', () => {
    wrapper.expectElement('[data-cy="reason-for-visiting-other"]').toExist();
  });

  it('should render validation error', () => {
    wrapper.expectElement('[data-cy="reason-for-visiting-other-error-message"]').toExist();
  });
});
