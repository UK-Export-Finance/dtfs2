const { componentRenderer } = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/amendments/_macros/tasks-table-amendments.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
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
              id: 'BUSINESS_SUPPORT',
              name: 'Business support group',
            },
            status: 'To do',
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
              id: 'BUSINESS_SUPPORT',
              name: 'Business support group',
            },
            status: 'In progress',
          },
        ],
      },
    ],
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
});
