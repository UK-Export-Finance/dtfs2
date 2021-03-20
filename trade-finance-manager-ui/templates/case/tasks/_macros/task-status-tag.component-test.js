const componentRenderer = require('../../../../component-tests/componentRenderer');
const component = '../templates/case/tasks/_macros/task-status-tag.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    status: 'To do',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render govukTag with status text', () => {
    wrapper.expectText('[data-cy="status-tag"]').toRead(params.status);
  });
});
