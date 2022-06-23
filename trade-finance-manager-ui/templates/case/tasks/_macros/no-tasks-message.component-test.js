const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/tasks/_macros/no-tasks-message.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  describe('when params.selectedTaskFilter is `user`', () => {
    it('should render `no tasks` message', () => {
      const params = {
        selectedTaskFilter: 'user',
        taskType: 'deal',
      };
      wrapper = render(params);

      wrapper.expectText('[data-cy="no-tasks-user"]').toRead('You have no tasks assigned to you in this deal.');

      wrapper.expectElement('[data-cy="no-tasks-team"]').notToExist();
      wrapper.expectElement('[data-cy="no-tasks-deal"]').notToExist();
    });
  });

  describe('when params.selectedTaskFilter is `team`', () => {
    it('should render `no tasks` message', () => {
      const params = {
        selectedTaskFilter: 'team',
        taskType: 'deal',
      };
      wrapper = render(params);

      wrapper.expectText('[data-cy="no-tasks-team"]').toRead('Your team has no tasks in this deal.');

      wrapper.expectElement('[data-cy="no-tasks-user"]').notToExist();
      wrapper.expectElement('[data-cy="no-tasks-deal"]').notToExist();
    });
  });

  describe('when params.selectedTaskFilter is `all`', () => {
    it('should render `no tasks` message', () => {
      const params = {
        selectedTaskFilter: 'all',
        taskType: 'deal',
      };
      wrapper = render(params);

      wrapper.expectText('[data-cy="no-tasks-deal"]').toRead('There are no tasks for this deal.');

      wrapper.expectElement('[data-cy="no-tasks-user"]').notToExist();
      wrapper.expectElement('[data-cy="no-tasks-team"]').notToExist();
    });
  });
});
