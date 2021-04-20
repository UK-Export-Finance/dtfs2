/* eslint-disable no-underscore-dangle */

const {
  getTask,
  getGroup,
  isFirstTaskInAGroup,
  isFirstTaskInFirstGroup,
  previousTaskIsComplete,
  firstTaskIsComplete,
  isFirstTask,
  canUpdateTask,
  getNewAssigneeFullName,
  updateTask,
  updateTasksCanEdit,
  updateUserTasks,
  updateOriginalAssigneeTasks,
  updateTfmTask,
} = require('./tasks.controller');

const api = require('../api');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_TASKS = require('../__mocks__/mock-tasks');
const CONSTANTS = require('../../constants');

describe('tasks controller  / tasks helper functions', () => {
  describe('getTask', () => {
    it('should return task by id', () => {
      const mockGroupTasks = [
        { id: '1', groupId: 1 },
        { id: '2', groupId: 1 },
        { id: '3', groupId: 1 },
      ];

      const result = getTask('2', mockGroupTasks);
      expect(result).toEqual(mockGroupTasks[1]);
    });
  });

  describe('getGroup', () => {
    it('should return a group by id', () => {
      const mockTasks = [
        {
          groupTitle: 'Group 1 tasks',
          id: 1,
          groupTasks: [],
        },
        {
          groupTitle: 'Group 2 tasks',
          id: 2,
          groupTasks: [],
        },
      ];

      const result = getGroup(mockTasks, 2);
      expect(result).toEqual(mockTasks[1]);
    });
  });

  describe('isFirstTaskInAGroup', () => {
    it('returns true when task id is 1 and group id is greater than 1', () => {
      const result = isFirstTaskInAGroup('1', 2);
      expect(result).toEqual(true);
    });

    it('returns false when task id is NOT 1', () => {
      const result = isFirstTaskInAGroup('2', 2);
      expect(result).toEqual(false);
    });

    it('returns false when group id is 1', () => {
      const result = isFirstTaskInAGroup('1', 1);
      expect(result).toEqual(false);
    });
  });

  describe('isFirstTaskInFirstGroup', () => {
    it('returns true when task id and group id is 1', () => {
      const result = isFirstTaskInFirstGroup('1', 1);
      expect(result).toEqual(true);
    });

    it('returns false when task id is NOT 1', () => {
      const result = isFirstTaskInFirstGroup('2', 1);
      expect(result).toEqual(false);
    });

    it('returns false when group id is NOT 1', () => {
      const result = isFirstTaskInFirstGroup('1', 2);
      expect(result).toEqual(false);
    });
  });

  describe('previousTaskIsComplete', () => {
    describe('when there is no previous task', () => {
      it('should return true', () => {
        const mockGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1 },
          ],
        };

        const result = previousTaskIsComplete(MOCK_TASKS, mockGroup, '1');
        expect(result).toEqual(true);
      });
    });

    describe('when the previous task has status `Done`', () => {
      it('should return true', () => {
        const mockGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'Done' },
            { id: '2', groupId: 1, status: 'To do' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = previousTaskIsComplete(MOCK_TASKS, mockGroup, '2');
        expect(result).toEqual(true);
      });
    });

    describe('when the group is not the first group and task id is first in the group', () => {
      it('should return true when the previous group\'s last task has `Done` status', () => {
        const MOCK_SECOND_GROUP = {
          id: 2,
          groupTasks: [
            { id: '1', groupId: 2, status: 'To do' },
            { id: '2', groupId: 2, status: 'To do' },
            { id: '3', groupId: 2, status: 'To do' },
          ],
        };

        const MOCK_TASKS_FIRST_GROUP_COMPLETED = [
          {
            groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
            id: 1,
            groupTasks: [
              {
                id: '1',
                groupId: 1,
                title: CONSTANTS.TASKS.AIN.GROUP_1.MATCH_OR_CREATE_PARTIES,
                team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
                status: CONSTANTS.TASKS.STATUS.COMPLETED,
                assignedTo: {
                  userId: CONSTANTS.TASKS.UNASSIGNED,
                  userFullName: CONSTANTS.TASKS.UNASSIGNED,
                },
              },
              {
                id: '2',
                groupId: 1,
                title: CONSTANTS.TASKS.AIN.GROUP_1.CREATE_OR_LINK_SALESFORCE,
                team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
                status: CONSTANTS.TASKS.STATUS.COMPLETED,
                assignedTo: {
                  userId: CONSTANTS.TASKS.UNASSIGNED,
                  userFullName: CONSTANTS.TASKS.UNASSIGNED,
                },
              },
            ],
          },
          MOCK_SECOND_GROUP,
        ];

        const result = previousTaskIsComplete(
          MOCK_TASKS_FIRST_GROUP_COMPLETED,
          MOCK_SECOND_GROUP,
          '1',
        );
        expect(result).toEqual(true);
      });
    });

    describe('when the previous task status is NOT `Done`', () => {
      it('should return false', () => {
        const mockGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'In progress' },
            { id: '2', groupId: 1, status: 'To do' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = previousTaskIsComplete(MOCK_TASKS, mockGroup, '3');
        expect(result).toEqual(false);
      });
    });
  });

  describe('firstTaskIsComplete', () => {
    describe('when the first task has status `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', groupId: 1, status: 'Done' },
          { id: '2', groupId: 1, status: 'To do' },
          { id: '3', groupId: 1, status: 'To do' },
        ];

        const result = firstTaskIsComplete(mockGroupTasks);
        expect(result).toEqual(true);
      });
    });

    describe('when the first task status is NOT `Done`', () => {
      it('should return true', () => {
        const mockGroupTasks = [
          { id: '1', groupId: 1, status: 'In progress' },
          { id: '2', groupId: 1, status: 'To do' },
          { id: '3', groupId: 1, status: 'To do' },
        ];

        const result = firstTaskIsComplete(mockGroupTasks);
        expect(result).toEqual(false);
      });
    });
  });

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
    describe('when previous task is complete', () => {
      it('should return true', () => {
        const mockParentGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'Done' },
            { id: '2', groupId: 1, status: 'Done' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = canUpdateTask(MOCK_TASKS, mockParentGroup, '3');

        expect(result).toEqual(true);
      });
    });


    describe('when previous task is NOT complete', () => {
      it('should return false', () => {
        const mockParentGroup = {
          id: 1,
          groupTasks: [
            { id: '1', groupId: 1, status: 'Done' },
            { id: '2', groupId: 1, status: 'To do' },
            { id: '3', groupId: 1, status: 'To do' },
          ],
        };

        const result = canUpdateTask(MOCK_TASKS, mockParentGroup, '3');

        expect(result).toEqual(false);
      });
    });
  });

  describe('getNewAssigneeFullName', () => {
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
        { id: '1', groupId: 1, status: 'Done' },
        { id: '2', groupId: 1, status: 'In progress' },
        { id: '3', groupId: 1, status: 'To do' },
      ];

      const mockTasks = [
        {
          groupTitle: 'Group 1 tasks',
          id: 1,
          groupTasks: mockGroup1Tasks,
        },
        {
          groupTitle: 'Group 2 tasks',
          id: 2,
          groupTasks: [],
        },
      ];

      const taskUpdate = {
        id: '2',
        groupId: 1,
        status: 'Done',
        assignedTo: {
          userFullName: 'Test Name',
          userId: '123456',
        },
      };

      const result = updateTask(mockTasks, 1, '2', taskUpdate);

      const expected = [
        {
          groupTitle: 'Group 1 tasks',
          id: 1,
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
          groupTitle: 'Group 2 tasks',
          id: 2,
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
          {
            id: '1',
            groupId: 1,
            status: 'Done',
            canEdit: true,
          },
          {
            id: '2',
            groupId: 1,
            status: 'To do',
            canEdit: false,
          },
          {
            id: '3',
            groupId: 1,
            status: 'To do',
            canEdit: false,
          },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = updateTasksCanEdit(mockTasks, 1, '1');

        const expected = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
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
          {
            id: '1',
            groupId: 1,
            status: 'Done',
            canEdit: false,
          },
          {
            id: '2',
            groupId: 1,
            status: 'Done',
            canEdit: true,
          },
          {
            id: '3',
            groupId: 1,
            status: 'To do',
            canEdit: false,
          },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = updateTasksCanEdit(mockTasks, 1, '2');

        const expected = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
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

  describe('updateUserTasks', () => {
    it('should add a task to users assignedTasks if a task.assignedTo.userI matches given userId', async () => {
      const mockUser = MOCK_USERS[0];
      const userId = mockUser._id;
      const {
        username,
        firstName,
        lastName,
      } = mockUser;

      const mockGroup1Tasks = [
        {
          id: '1',
          groupId: 1,
          status: 'In progress',
          assignedTo: {
            userFullName: `${firstName} ${lastName}`,
            userId,
          },
        },
        {
          id: '2',
          groupId: 1,
          status: 'To do',
        },
        {
          id: '3',
          groupId: 1,
          status: 'To do',
        },
      ];

      const mockTasks = [
        {
          groupTitle: 'Group 1 tasks',
          id: 1,
          groupTasks: mockGroup1Tasks,
        },
        {
          groupTitle: 'Group 2 tasks',
          id: 2,
          groupTasks: [],
        },
      ];


      // check user initially has no tasks assigned
      const user = await api.findUser(username);

      expect(user.assignedTasks).toEqual([]);

      // assign a task to user
      const updatedUserTasks = await updateUserTasks(mockTasks, userId);
      expect(updatedUserTasks.length).toEqual(1);
      expect(updatedUserTasks).toEqual([mockGroup1Tasks[0]]);
    });
  });

  describe('updateOriginalAssigneeTasks', () => {
    it('should remove a task from users tasks if user has been assigned and then unassigned', async () => {
      const mockUser = MOCK_USERS[0];
      const userId = mockUser._id;
      const {
        username,
        firstName,
        lastName,
      } = mockUser;

      const mockGroup1Tasks = [
        {
          id: '1',
          groupId: 1,
          status: 'In progress',
          assignedTo: {
            userFullName: `${firstName} ${lastName}`,
            userId,
          },
        },
        {
          id: '2',
          groupId: 1,
          status: 'To do',
        },
        {
          id: '3',
          groupId: 1,
          status: 'To do',
        },
      ];

      const mockTasks = [
        {
          groupTitle: 'Group 1 tasks',
          id: 1,
          groupTasks: mockGroup1Tasks,
        },
        {
          groupTitle: 'Group 2 tasks',
          id: 2,
          groupTasks: [],
        },
      ];


      // check user initially has no tasks assigned
      const user = await api.findUser(username);

      expect(user.assignedTasks).toEqual([]);

      // assign a task to user
      const updatedUserTasks = await updateUserTasks(mockTasks, userId);
      expect(updatedUserTasks.length).toEqual(1);

      const updatedUserTasksAfterUnassigned = await updateOriginalAssigneeTasks(userId, '1');

      expect(updatedUserTasksAfterUnassigned.length).toEqual(0);
    });
  });

  describe('updateTfmTask', () => {
    const dealId = MOCK_DEAL_MIA_SUBMITTED._id;

    const mockUser = MOCK_USERS[0];
    const userId = mockUser._id;
    const { firstName, lastName } = mockUser;

    it('should return the updated task', async () => {
      const tfmTaskUpdate = {
        id: '1',
        groupId: 1,
        assignedTo: {
          userId,
        },
        status: 'In progress',
        updatedBy: userId,
      };

      const result = await updateTfmTask(dealId, tfmTaskUpdate);

      const expectedUpdatedTask = {
        id: tfmTaskUpdate.id,
        groupId: tfmTaskUpdate.groupId,
        assignedTo: {
          userId: tfmTaskUpdate.assignedTo.userId,
          userFullName: `${firstName} ${lastName}`,
        },
        status: tfmTaskUpdate.status,
        lastEdited: expect.any(String),
      };

      expect(result).toEqual(expectedUpdatedTask);
    });

    describe('when task cannot be updated', () => {
      it('should return the original task', async () => {
        // MOCK_TASKS (that gets stubbed in api tests)
        // has task #1 as 'To do'.
        // therefore task #2 cannot be updated.

        const tfmTask2Update = {
          id: '2',
          groupId: 1,
          assignedTo: {
            userId,
          },
          status: 'In progress',
          updatedBy: userId,
        };

        const result = await updateTfmTask(dealId, tfmTask2Update);

        const originalTask2 = MOCK_TASKS[0].groupTasks[1];

        expect(result).toEqual(originalTask2);
      });
    });

    describe('when an MIA deal has the first task in the first group completed immediately', () => {
      it('should update deal.tfm.stage to `In progress`', async () => {
        const tfmTaskUpdate = {
          id: '1',
          groupId: 1,
          assignedTo: {
            userId,
          },
          status: 'Done',
          updatedBy: userId,
        };

        await updateTfmTask(dealId, tfmTaskUpdate);

        const deal = await api.findOneDeal(dealId);

        expect(deal.tfm.stage).toEqual('In progress');
      });
    });

    describe('when an MIA deal has the first task in the first group completed after being `In progress`', () => {
      it('should update deal.tfm.stage to `In progress`', async () => {
        // make sure task is in `To do` state.
        const tfmTaskUpdateTodo = {
          id: '1',
          groupId: 1,
          assignedTo: {
            userId,
          },
          status: 'To do',
          updatedBy: userId,
        };

        await updateTfmTask(dealId, tfmTaskUpdateTodo);

        // const initalDeal = await updateDealStage(dealId, '');
        await api.resetDealForApiTest(dealId);

        const initalDeal = await api.findOneDeal(dealId);

        expect(initalDeal.tfm.stage).toBeUndefined();

        const tfmTaskUpdateInProgress = {
          id: '1',
          groupId: 1,
          assignedTo: {
            userId,
          },
          status: 'In progress',
          updatedBy: userId,
        };

        await updateTfmTask(dealId, tfmTaskUpdateInProgress);

        const dealAfterFirstUpdate = await api.findOneDeal(dealId);

        expect(dealAfterFirstUpdate.tfm.stage).toEqual('In progress');

        const tfmTaskUpdateDone = {
          id: '1',
          groupId: 1,
          assignedTo: {
            userId,
          },
          status: 'Done',
          updatedBy: userId,
        };

        const dealAfterSecondUpdate = await api.findOneDeal(dealId);

        expect(dealAfterSecondUpdate.tfm.stage).toEqual('In progress');
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
