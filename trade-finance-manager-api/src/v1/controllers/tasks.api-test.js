/* eslint-disable no-underscore-dangle */

const {
  updateTask,
  generateTaskDates,
  updateTasksCanEdit,
  isMIAdeal,
  taskIsCompletedImmediately,
  shouldUpdateDealStage,
  updateTfmTask,
} = require('./tasks.controller');

const api = require('../api');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_AIN_TASKS = require('../__mocks__/mock-AIN-tasks');

describe('tasks controller  / tasks helper functions', () => {
  const mockDeal = {
    dealSnapshot: MOCK_DEAL_MIA_SUBMITTED,
    tfm: {
      history: {
        emails: [],
      },
    },
  };

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

  describe('generateTaskDates', () => {
    it('should return object with lastEdited timestamp', () => {
      const result = generateTaskDates();

      const expected = {
        lastEdited: expect.any(String),
      };

      expect(result).toEqual(expected);
    });

    describe('when statusFrom is `To do` and statusTo is `In progress`', () => {
      it('should return dateStarted', () => {
        const result = generateTaskDates('To do', 'In progress');

        const expected = {
          lastEdited: expect.any(String),
          dateStarted: expect.any(String),
        };

        expect(result).toEqual(expected);
      });
    });

    describe('when statusFrom is `To do` and statusTo is `Done`', () => {
      it('should return dateStarted and dateCompleted', () => {
        const result = generateTaskDates('To do', 'Done');

        const expected = {
          lastEdited: expect.any(String),
          dateStarted: expect.any(String),
          dateCompleted: expect.any(String),
        };

        expect(result).toEqual(expected);
      });
    });


    describe('when statusFrom is `In progress` and statusTo is `Done`', () => {
      it('should return dateCompleted', () => {
        const result = generateTaskDates('In progress', 'Done');

        const expected = {
          lastEdited: expect.any(String),
          dateCompleted: expect.any(String),
        };

        expect(result).toEqual(expected);
      });
    });
  });

  describe('updateTasksCanEdit', () => {
    describe('when given a task with `Done` status', () => {
      it('should mark the task as canEdit = false', async () => {
        const mockGroup1Tasks = [
          {
            id: '1',
            groupId: 1,
            status: 'Done',
            canEdit: true,
            title: 'Test',
          },
          {
            id: '2',
            groupId: 1,
            status: 'To do',
            canEdit: false,
            title: 'Test',
          },
          {
            id: '3',
            groupId: 1,
            status: 'To do',
            canEdit: false,
            title: 'Test',
          },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = await updateTasksCanEdit(mockTasks, 1, '1', mockDeal);

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
      it('should mark the task as canEdit = false', async () => {
        const mockGroup1Tasks = [
          {
            id: '1',
            groupId: 1,
            status: 'Done',
            canEdit: false,
            title: 'Test',
          },
          {
            id: '2',
            groupId: 1,
            status: 'Done',
            canEdit: true,
            title: 'Test',
          },
          {
            id: '3',
            groupId: 1,
            status: 'Cannot start yet',
            canEdit: false,
            title: 'Test',
          },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = await updateTasksCanEdit(mockTasks, 1, '2', mockDeal);

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

    describe('when given a task that is not task #1, and previous task has `Done` status', () => {
      it('should mark the next task as canEdit = true and change status to `To do`', async () => {
        const mockGroup1Tasks = [
          {
            id: '1',
            groupId: 1,
            status: 'Done',
            canEdit: false,
            title: 'Test',
          },
          {
            id: '2',
            groupId: 1,
            status: 'Done',
            canEdit: true,
            title: 'Test',
          },
          {
            id: '3',
            groupId: 1,
            status: 'Cannot start yet',
            canEdit: false,
            title: 'Test',
          },
        ];

        const mockTasks = [
          {
            groupTitle: 'Group 1 tasks',
            id: 1,
            groupTasks: mockGroup1Tasks,
          },
        ];

        const result = await updateTasksCanEdit(mockTasks, 1, '2', mockDeal);

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
              {
                ...mockGroup1Tasks[2],
                canEdit: true,
                status: 'To do',
              },
            ],
          },
        ];

        expect(result).toEqual(expected);
      });
    });
  });

  describe('isMIAdeal', () => {
    it('should return true when submissionType is MIA', () => {
      const result = isMIAdeal(MOCK_DEAL_MIA_SUBMITTED.details.submissionType);

      expect(result).toEqual(true);
    });

    it('should return false when submissionType is NOT MIA', () => {
      const result = isMIAdeal('test');

      expect(result).toEqual(false);
    });
  });

  describe('taskIsCompletedImmediately', () => {
    it('should return true when status changes from `To do` to `Done`', () => {
      const result = taskIsCompletedImmediately(
        'To do',
        'Done',
      );

      expect(result).toEqual(true);
    });

    it('should return false when status does NOT change from `To do` to `Done`', () => {
      const result = taskIsCompletedImmediately(
        'To do',
        'In progress',
      );

      expect(result).toEqual(false);
    });
  });

  describe('shouldUpdateDealStage', () => {
    const submissionType = 'Manual Inclusion Application';
    const taskId = '1';
    const groupid = 1;

    it('should return true when submissionType is MIA, is first task in first group, task status changes to `in progress`', () => {
      const statusFrom = 'To do';
      const statusTo = 'In progress';

      const result = shouldUpdateDealStage(
        submissionType,
        taskId,
        groupid,
        statusFrom,
        statusTo,
      );

      expect(result).toEqual(true);
    });

    it('should return true when submissionType is MIA, is first task in first group, task status changes from `To do` to `Done`', () => {
      const statusFrom = 'To do';
      const statusTo = 'Done';

      const result = shouldUpdateDealStage(
        submissionType,
        taskId,
        groupid,
        statusFrom,
        statusTo,
      );

      expect(result).toEqual(true);
    });

    it('should return false when a condition is not met', () => {
      const statusFrom = 'To do';
      const statusTo = 'To do';

      const result = shouldUpdateDealStage(
        submissionType,
        taskId,
        groupid,
        statusFrom,
        statusTo,
      );

      expect(result).toEqual(false);
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
        status: 'Done',
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
        dateStarted: expect.any(String),
        dateCompleted: expect.any(String),
      };

      expect(result).toEqual(expectedUpdatedTask);
    });

    describe('when task cannot be updated', () => {
      it('should return the original task', async () => {
        // MOCK_AIN_TASKS (that gets stubbed in api tests)
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

        const originalTask2 = MOCK_AIN_TASKS[0].groupTasks[1];

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

        await updateTfmTask(dealId, tfmTaskUpdateDone);

        const dealAfterSecondUpdate = await api.findOneDeal(dealId);

        expect(dealAfterSecondUpdate.tfm.stage).toEqual('In progress');
      });
    });
  });
});

/* eslint-enable no-underscore-dangle */
