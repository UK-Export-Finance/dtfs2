const componentRenderer = require('../../../../component-tests/componentRenderer');
const component = '../templates/case/tasks/_macros/tasks-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '100200',
    tasks: [
      {
        groupTitle: 'Test title',
        groupTasks: [
          {
            id: '1',
            title: 'Title A',
            assignedTo: {
              userId: '1234',
              userFullName: 'Joe Bloggs',
            },
            team: {
              id: 'BUSINESS_SUPPORT',
              name: 'Business support group',
            },
            status: 'To do',
          },
          {
            id: '2',
            title: 'Title B',
            assignedTo: {
              userId: '5678',
              userFullName: 'Joe Bloggs',
            },
            team: {
              id: 'BUSINESS_SUPPORT',
              name: 'Business support group',
            },
            status: 'In progress',
            canEdit: true,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headers', () => {
    it('should render `assigned to` header', () => {
      wrapper.expectText('[data-cy="tasks-table-header-assigned-to"]').toRead('Assigned to');
    });

    it('should render `team` header', () => {
      wrapper.expectText('[data-cy="tasks-table-header-team"]').toRead('Team');
    });
  });

  it('should render tasks group title', () => {
    const selector = '[data-cy="task-group-title"]';
    wrapper.expectText(selector).toRead(params.tasks[0].groupTitle);
  });

  describe('for each task in a tasks group', () => {
    describe('when a task has `canEdit`', () => {
      it('should render link to task', () => {
        const taskWithCanEdit = params.tasks[0].groupTasks[1];

        const linkSelector = `[data-cy="task-table-row-${taskWithCanEdit.id}-link"]`;

        wrapper.expectLink(linkSelector).toLinkTo(
          `/case/${params.caseId}/tasks/${taskWithCanEdit.id}`,
          taskWithCanEdit.title,
        );

        wrapper.expectElement(`[data-cy="task-table-row-${taskWithCanEdit.id}-title"]`).notToExist();
      });
    });

    describe('when a task does NOT have `canEdit`', () => {
      it('should NOT render link to task and render title', () => {
        const taskWithoutCanEdit = params.tasks[0].groupTasks[0];

        const linkSelector = `[data-cy="task-table-row-${taskWithoutCanEdit.id}-link"]`;

        wrapper.expectElement(linkSelector).notToExist();

        wrapper.expectText(`[data-cy="task-table-row-${taskWithoutCanEdit.id}-title"]`).toRead(taskWithoutCanEdit.title);
      });
    });

    it('should render assignee\'s full name', () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach((task) => {
          const selector = `[data-cy="task-table-row-${task.id}-user-full-name"]`;
          wrapper.expectText(selector).toRead(task.assignedTo.userFullName);
        });
      });
    });

    it('should render team name', () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach((task) => {
          const selector = `[data-cy="task-table-row-${task.id}-team-name"]`;
          wrapper.expectText(selector).toRead(task.team.name);
        });
      });
    });

    it('should render status tag', () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach((task) => {
          const selector = '[data-cy="status-tag"]';
          wrapper.expectElement(selector).toExist();
        });
      });
    });
  });
  });
