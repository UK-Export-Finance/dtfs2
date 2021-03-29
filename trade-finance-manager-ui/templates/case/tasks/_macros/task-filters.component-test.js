const componentRenderer = require('../../../../component-tests/componentRenderer');
const component = '../templates/case/tasks/_macros/task-filters.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    status: 'To do',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render `your tasks` radio button', () => {
    wrapper.expectElement('[data-cy="task-radio-button-your-tasks"]').toExist();
    wrapper.expectInput('[data-cy="task-radio-button-your-tasks"]').toHaveValue('user');
  });

  it('should render `your team` radio button', () => {
    wrapper.expectElement('[data-cy="task-radio-button-your-team"]').toExist();
    wrapper.expectInput('[data-cy="task-radio-button-your-team"]').toHaveValue('team');
  });

  it('should render `all` radio button', () => {
    wrapper.expectElement('[data-cy="task-radio-button-all"]').toExist();
    wrapper.expectInput('[data-cy="task-radio-button-all"]').toHaveValue('all');
  });
});
