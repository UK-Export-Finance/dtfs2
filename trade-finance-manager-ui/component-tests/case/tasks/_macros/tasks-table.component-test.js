const { TEAM_IDS } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../../componentRenderer');
const { localiseTimestamp } = require('../../../../server/nunjucks-configuration/filter-localiseTimestamp');

const component = '../templates/case/tasks/_macros/tasks-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '100200',
    tasks: [
      {
        groupTitle: 'Test title',
        id: 1,
        groupTasks: [
          {
            id: '1',
            groupId: 1,
            title: 'Title A',
            assignedTo: {
              userId: '1234',
              userFullName: 'Joe Bloggs',
            },
            team: {
              id: TEAM_IDS.BUSINESS_SUPPORT,
              name: 'Business support group',
            },
            status: 'To do',
            dateStarted: 1606900616651,
            dateCompleted: 1606900616651,
          },
          {
            id: '2',
            groupId: 1,
            title: 'Title B',
            assignedTo: {
              userId: '5678',
              userFullName: 'Joe Bloggs',
            },
            team: {
              id: TEAM_IDS.BUSINESS_SUPPORT,
              name: 'Business support group',
            },
            status: 'In progress',
            canEdit: true,
            dateStarted: 1606900616651,
            dateCompleted: 1606900616651,
          },
        ],
      },
    ],
    userTimezone: 'Europe/London',
    user: {
      teams: [TEAM_IDS.BUSINESS_SUPPORT],
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headers', () => {
    describe.each([
      ['Task', 'tasks-table-header-task'],
      ['Assigned to', 'tasks-table-header-assigned-to'],
      ['Team', 'tasks-table-header-team'],
      ['Date started', 'tasks-table-header-date-started'],
      ['Date completed', 'tasks-table-header-date-completed'],
      ['Status', 'tasks-table-header-status'],
    ])('`%s` header', (headerText, dataCy) => {
      it('should render the header', () => {
        wrapper.expectText(`[data-cy="${dataCy}"]`).toRead(headerText);
      });

      it('should set the `scope` attribute of the header to `col`', () => {
        wrapper.expectElement(`[data-cy="${dataCy}"]`).toHaveAttribute('scope', 'col');
      });
    });
  });

  it('should render tasks group title', () => {
    const selector = '[data-cy="task-group-title"]';
    wrapper.expectText(selector).toRead(params.tasks[0].groupTitle);
  });

  describe('for each task in a tasks group', () => {
    describe('when a task has `canEdit`', () => {
      it('should render link to task if user in same group as task', () => {
        const taskWithCanEdit = params.tasks[0].groupTasks[1];

        const linkSelector = `[data-cy="task-table-row-group-${taskWithCanEdit.groupId}-task-${taskWithCanEdit.id}-link"]`;

        wrapper.expectLink(linkSelector).toLinkTo(`/case/${params.caseId}/tasks/${taskWithCanEdit.groupId}/${taskWithCanEdit.id}`, taskWithCanEdit.title);

        wrapper.expectElement(`[data-cy="task-table-row-group-${taskWithCanEdit.groupId}-task-${taskWithCanEdit.id}-title"]`).notToExist();
      });
    });

    describe('when a task does NOT have `canEdit`', () => {
      it('should NOT render link to task and render title', () => {
        const taskWithoutCanEdit = params.tasks[0].groupTasks[0];

        const linkSelector = `[data-cy="task-table-row-${taskWithoutCanEdit.id}-link"]`;

        wrapper.expectElement(linkSelector).notToExist();

        wrapper
          .expectText(`[data-cy="task-table-row-group-${taskWithoutCanEdit.groupId}-task-${taskWithoutCanEdit.id}-title"]`)
          .toRead(taskWithoutCanEdit.title);
      });
    });

    it("should render assignee's full name", () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach((task) => {
          const selector = `[data-cy="task-table-row-group-${task.groupId}-task-${task.id}-user-full-name"]`;
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

    it('should render `date started`', () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach((task) => {
          const selector = `[data-cy="task-table-row-group-${task.groupId}-task-${task.id}-date-started"]`;

          const expected = localiseTimestamp(task.dateStarted, 'dd MMM yyyy', params.userTimezone);
          wrapper.expectText(selector).toRead(expected);
        });
      });
    });

    it('should render `date completed`', () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach((task) => {
          const selector = `[data-cy="task-table-row-group-${task.groupId}-task-${task.id}-date-completed"]`;

          const expected = localiseTimestamp(task.dateCompleted, 'dd MMM yyyy', params.userTimezone);
          wrapper.expectText(selector).toRead(expected);
        });
      });
    });

    it('should render status tag', () => {
      params.tasks.forEach((group) => {
        group.groupTasks.forEach(() => {
          const selector = '[data-cy="status-tag"]';
          wrapper.expectElement(selector).toExist();
        });
      });
    });
  });
});
