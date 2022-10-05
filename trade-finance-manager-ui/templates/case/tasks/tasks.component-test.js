const pageRenderer = require('../../../component-tests/pageRenderer');

const page = '../templates/case/tasks/tasks.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  describe('with tasks', () => {
    const params = {
      deal: {
        submissionType: 'Automatic Inclusion Notice',
      },
      tasks: [
        {
          groupTitle: 'Testing',
          groupTasks: [],
        },
      ],
      selectedTaskFilter: 'all',
    };

    beforeEach(() => {
      wrapper = render(params);
    });

    it('should render heading', () => {
      wrapper.expectText('[data-cy="tasks-heading"]').toRead('Tasks');
    });

    it('should render filters', () => {
      wrapper.expectElement('[data-cy="task-filters"]').toExist();
    });

    it('should render deal submission type', () => {
      wrapper.expectText('[data-cy="tasks-deal-submission-type"]').toRead(params.deal.submissionType);
    });

    it('should render tasks table', () => {
      wrapper.expectElement('[data-cy="tasks-table"]').toExist();
    });

    it('should NOT render `no tasks message` component', () => {
      wrapper.expectElement('[data-cy="no-tasks-message"]').notToExist();
    });
  });

  describe('when there are no tasks', () => {
    const params = {
      deal: {
        submissionType: 'Automatic Inclusion Notice',
      },
      tasks: [],
      selectedTaskFilter: 'all',
    };

    beforeEach(() => {
      wrapper = render(params);
    });

    it('should render `no tasks message` component', () => {
      wrapper.expectElement('[data-cy="no-tasks-message"]').toExist();
    });

    it('should NOT render tasks table', () => {
      wrapper.expectElement('[data-cy="tasks-table"]').notToExist();
    });
  });
});
