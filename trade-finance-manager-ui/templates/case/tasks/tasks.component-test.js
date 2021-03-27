const pageRenderer = require('../../../component-tests/pageRenderer');
const page = '../templates/case/tasks/tasks.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    deal: {
      details: {
        submissionType: 'Automatic Inclusion Notice',
      },
    },
    tfm: {
      tasks: [
        {
          groupTitle: 'Testing',
          groupTasks: [],
        }
      ],
    },
    selectedTaskFilter: 'all',    
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="tasks-heading"]').toRead('Tasks for this deal');
  });

  it('should render filters', () => {
    wrapper.expectElement('[data-cy="tasks-filters"]').toExist();
  });

  it('should render deal submission type', () => {
    wrapper.expectText('[data-cy="tasks-deal-submission-type"]').toRead(params.deal.details.submissionType);
  });

  it('should render tasks table', () => {
    wrapper.expectElement('[data-cy="tasks-table"]').toExist();
  });
});
