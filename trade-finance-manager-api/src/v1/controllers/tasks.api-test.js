/* eslint-disable no-underscore-dangle */

const {
  getTask,
  previousTaskIsComplete,
  firstTaskIsComplete,
  getParentGroupTasks,
  isFirstTask,
  canUpdateTask,
  getNewAssigneeFullName,
  updateTask,
  updateTasksCanEdit,
  updateTfmTask,
} = require('./task.controller');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_DEAL_MIA = require('../__mocks__/mock-deal-MIA');
const MOCK_TASKS = require('../__mocks__/mock-tasks');

describe('tasks controller helper functions', () => {
  describe('getTask', () => {
    it('should return task by id', () => {
      const mockGroupTasks = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ];

      const result = getTask('2', mockGroupTasks);
      expect(result).toEqual(mockGroupTasks[1]);
    });
  });

  describe('previousTaskIsComplete', () => {
    describe('when there is no previous task', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1' },
        ];

        const result = previousTaskIsComplete(mockGroupTasks, '1');
        expect(result).toEqual(true);
      });
    });

    describe('when the previous task has status `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', status: 'Done' },
          { id: '2', status: 'To do' },
          { id: '3', status: 'To do' },
        ];

        const result = previousTaskIsComplete(mockGroupTasks, '2');
        expect(result).toEqual(true);
      });
    });

    describe('when the previous task status is NOT `Done`', () => {
      it('should return false', () => {
        const mockGroupTasks = [
          { id: '1', status: 'In progress' },
          { id: '2', status: 'To do' },
          { id: '3', status: 'To do' },
        ];

        const result = previousTaskIsComplete(mockGroupTasks, '3');
        expect(result).toEqual(false);
      });
    });
  });

  describe('firstTaskIsComplete', () => {
    describe('when the first task has status `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', status: 'Done' },
          { id: '2', status: 'To do' },
          { id: '3', status: 'To do' },
        ];

        const result = firstTaskIsComplete(mockGroupTasks);
        expect(result).toEqual(true);
      });
    });

    describe('when the first task status is NOT `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', status: 'In progress' },
          { id: '2', status: 'To do' },
          { id: '3', status: 'To do' },
        ];

        const result = firstTaskIsComplete(mockGroupTasks);
        expect(result).toEqual(false);
      });
    });
  });

  // TODO I don't think this will work with multiple groups.
  // need a "belongs to group" flag in the actual task.
  // also need to think about UI routing.
  // it's currently task/1.
  // need to do task/1/3 i.e group 1, task 3

  // describe('getParentGroupTasks', () => {
  //   it('should return all tasks that the given task.id belongs to', () => {
  //     const mockGroup1Tasks = [
  //       { id: '1', , title: 'Group 1 task #1' },
  //     ];

  //     const mockGroup2Tasks = [
  //       { id: '1', title: 'Group 2 task #1' },
  //       { id: '2', title: 'Group 2 task #2' },
  //       { id: '3', title: 'Group 2 task #3' },
  //     ];

  //     const mockTasks = [
  //       {
  //         groupTitle: 'Group 1 tasks',
  //         groupTasks: mockGroup1Tasks,
  //       },
  //       {
  //         groupTitle: 'Group 2 tasks',
  //         groupTasks: mockGroup2Tasks,
  //       },
  //     ];

  //     const result = getParentGroupTasks(mockTasks, '1');
  //   });
  // });

  describe('isFirstTask', () => {
    describe('when taskId is `1`', () => {
      it('should return true', () => {
        const result = isFirstTask('1');
        expect(result).toEqual(true);
      });
    });

    describe('when taskId is NOT `1`', () => {
      it('should return false', () => {
        const result = isFirstTask('2');
        expect(result).toEqual(false);
      });
    });
  });

  describe('canUpdateTask', () => {
    describe('when is first task', () => {
      describe('when first task is NOT complete', () => {
        it('should return true', () => {
          const mockParentGroupTasks = [
            { id: '1', status: 'To do' },
            { id: '2', status: 'To do' },
            { id: '3', status: 'To do' },
          ];

          const result = canUpdateTask('1', mockParentGroupTasks);

          expect(result).toEqual(true);
        });
      });
      describe('when first task is complete', () => {
        describe('when first task is complete', () => {
          it('should return false', () => {
            const mockParentGroupTasks = [
              { id: '1', status: 'Done' },
              { id: '2', status: 'To do' },
              { id: '3', status: 'To do' },
            ];

            const result = canUpdateTask('1', mockParentGroupTasks);

            expect(result).toEqual(false);
          });
        });
      });
    });

    describe('when is NOT first task', () => {
      describe('when previous task is complete', () => {
        it('should return true', () => {
          const mockParentGroupTasks = [
            { id: '1', status: 'Done' },
            { id: '2', status: 'Done' },
            { id: '3', status: 'To do' },
          ];

          const result = canUpdateTask('3', mockParentGroupTasks);

          expect(result).toEqual(true);
        });
      });

      describe('when previous task is NOT complete', () => {
        it('should return false', () => {
          const mockParentGroupTasks = [
            { id: '1', status: 'Done' },
            { id: '2', status: 'In prorgess' },
            { id: '3', status: 'To do' },
          ];

          const result = canUpdateTask('3', mockParentGroupTasks);

          expect(result).toEqual(false);
        });
      });
    });
  });

  describe('getNewAssigneeFullName ', () => {
    it('should return user\'s full name', async () => {
      const mockUser = MOCK_USERS[0];
      const result = await getNewAssigneeFullName(mockUser._id);

      const { firstName, lastName } = mockUser;
      const expected = `${firstName} ${lastName}`;

      expect(result).toEqual(expected);
    });

    describe('when the given user id is `Unassigned`', () => {
      it('should return `Unassigned`', async () => {
        const result = await getNewAssigneeFullName('Unassigned');

        expect(result).toEqual('Unassigned');
      });
    });
  });

  describe('updateTask', () => {
    it('should update a single task in a group', () => {
      const mockGroup1Tasks = [
        { id: '1', status: 'Done' },
        { id: '2', status: 'In progress' },
        { id: '3', status: 'To do' },
      ];

      const mockTasks = [
        {
          groupTitle: 'Group 1 tasks',
          groupTasks: mockGroup1Tasks,
        },
        {
          groupTitle: 'Group 1 tasks',
          groupTasks: [],
        },
      ];

      const taskUpdate = {
        id: '2',
        status: 'Done',
        assignedTo: {
          userFullName: 'Test Name',
          userId: '123456',
        },
      };

      const result = updateTask(mockTasks, '2', taskUpdate);

      const expected = [
        {
          groupTitle: 'Group 1 tasks',
          groupTasks: [
            mockGroup1Tasks[0],
            {
              ...mockGroup1Tasks[1],
              ...taskUpdate,
            },
            mockGroup1Tasks[2],
          ],
        },
        {
          groupTitle: 'Group 1 tasks',
          groupTasks: [],
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('updateTasksCanEdit', () => {
    describe('when given a task with `Done` status', () => {
      it('should mark the task as canEdit = false', () => {
        const mockGroup1Tasks = [
          { id: '1', status: 'Done', canEdit: true },
          { id: '2', status: 'To do', canEdit: false },
          { id: '3', status: 'To do', canEdit: false },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = updateTasksCanEdit(mockTasks, '1');

        const expected = [
          {
            groupTitle: 'Group 1 tasks',
            groupTasks: [
              {
                ...mockGroup1Tasks[0],
                canEdit: false,
              },
              mockGroup1Tasks[1],
              mockGroup1Tasks[2],
            ],
          },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when given a task that is not task #1, and previous task has `Done` status', () => {
      it('should mark the task as canEdit = false', () => {
        const mockGroup1Tasks = [
          { id: '1', status: 'Done', canEdit: false },
          { id: '2', status: 'Done', canEdit: true },
          { id: '3', status: 'To do', canEdit: false },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = updateTasksCanEdit(mockTasks, '2');

        const expected = [
          {
            groupTitle: 'Group 1 tasks',
            groupTasks: [
              mockGroup1Tasks[0],
              {
                ...mockGroup1Tasks[1],
                canEdit: false,
              },
              mockGroup1Tasks[2],
            ],
          },
        ];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('updateTfmTask', () => {
    const dealId = MOCK_DEAL_MIA._id;

    const mockUser = MOCK_USERS[0];
    const userId = mockUser._id;
    const { firstName, lastName } = mockUser;

    it('should return the updated task', async () => {
      const tfmTaskUpdate = {
        id: '1',
        assignedTo: {
          userId,
        },
        status: 'In progress',
        updatedBy: userId,
      };

      const result = await updateTfmTask(dealId, tfmTaskUpdate);

      const expectedUpdatedTask = {
        id: tfmTaskUpdate.id,
        assignedTo: {
          userId: tfmTaskUpdate.assignedTo.userId,
          userFullName: `${firstName} ${lastName}`,
        },
        status: tfmTaskUpdate.status,
      };

      expect(result).toEqual(expectedUpdatedTask);
    });

    describe('when task cannot be updated', () => {
      it('should return the original task', async () => {
        // MOCK_TASKS (that gets stubbed in api tests)
        // has task #1 as 'To do'.
        // therefore task #2 cannot be updated.

        const tfmTaskUpdate = {
          id: '2',
          assignedTo: {
            userId,
          },
          status: 'In progress',
          updatedBy: userId,
        };

        const result = await updateTfmTask(dealId, tfmTaskUpdate);

        const originalTask2 = MOCK_TASKS[0].groupTasks[1];

        expect(result).toEqual(originalTask2);
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
