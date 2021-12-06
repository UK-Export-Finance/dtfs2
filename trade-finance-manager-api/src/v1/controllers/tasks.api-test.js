const {
  updateTask,
  updateAllTasks,
  updateTfmTask,
} = require('./tasks.controller');
const { handleTaskEditFlagAndStatus } = require('../tasks/tasks-edit-logic');
const mapTaskObject = require('../tasks/map-task-object');

const api = require('../api');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_AIN_TASKS = require('../__mocks__/mock-AIN-tasks');
const MOCK_MIA_TASKS = require('../__mocks__/mock-MIA-tasks');
const {
  MOCK_GROUP1,
  MOCK_GROUP2,
  MOCK_GROUP3,
  MOCK_GROUP4,
} = require('../__mocks__/mock-MIA-grouped-tasks');
const MOCK_DEAL_AIN_SUBMITTED = require('../__mocks__/mock-deal-AIN-submitted');
const MOCK_MIA_SECOND_SUBMIT = require('../__mocks__/mock-deal-MIA-second-submit');

const CONSTANTS = require('../../constants');

const taskUpdateBase = {
  assignedTo: {
    userId: MOCK_USERS[0]._id,
    userFullName: `${MOCK_USERS[0].firstName} ${MOCK_USERS[0].lastName}`,
  },
  status: 'Done',
  updatedBy: MOCK_USERS[0]._id,
};

const createTaskUpdateObj = (groupId, taskId) => ({
  ...taskUpdateBase,
  id: String(taskId),
  groupId,
});

describe('tasks controller', () => {
  const mockDeal = {
    _id: MOCK_DEAL_MIA_SUBMITTED._id,
    ukefDealId: MOCK_DEAL_MIA_SUBMITTED.ukefDealId,
    exporter: {
      companyName: MOCK_DEAL_MIA_SUBMITTED.submissionDetails['supplier-name'],
    },
    tfm: {
      history: { emails: [] },
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

      const result = updateTask(mockTasks, taskUpdate);

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

  /*
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

      describe('when task group 2 is finished, task group 3 should be set on todo and editable', () => {
        it('should change all of task group 3 tasks', async () => {
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
              canEdit: false,
              title: 'Test',
            },
            {
              id: '3',
              groupId: 1,
              status: 'Done',
              canEdit: false,
              title: 'Test',
            },
          ];

          const mockGroup2Tasks = [
            {
              id: '1',
              groupId: 2,
              status: 'Done',
              canEdit: false,
              title: 'Test',
            },
          ];

          const mockGroup3Tasks = [
            {
              id: '1',
              groupId: 3,
              status: 'Cannot start yet',
              canEdit: false,
              title: 'Test',
            },
            {
              id: '2',
              groupId: 3,
              status: 'Cannot start yet',
              canEdit: false,
              title: 'Test',
            },
            {
              id: '3',
              groupId: 3,
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
            {
              groupTitle: 'Group 2 tasks',
              id: 2,
              groupTasks: mockGroup2Tasks,
            },
            {
              groupTitle: 'Group 3 tasks',
              id: 3,
              groupTasks: mockGroup3Tasks,
            },
          ];

          const result = await updateTasksCanEdit(mockTasks, 2, '1', mockDeal);

          const expected = [
            {
              groupTitle: 'Group 3 tasks',
              id: 3,
              groupTasks: [
                {
                  ...mockGroup3Tasks[0],
                  status: 'To do',
                  canEdit: true,
                },
                {
                  ...mockGroup3Tasks[1],
                  status: 'To do',
                  canEdit: true,
                },
                {
                  ...mockGroup3Tasks[2],
                  status: 'To do',
                  canEdit: true,
                },
              ],
            },
          ];

          expect(result[2]).toEqual(expected[0]);
        });
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
  */

  describe('updateAllTasks', () => {
    it('should map over all tasks and return handleTaskEditFlagAndStatus for each task', async () => {
      const tfmTaskUpdate = createTaskUpdateObj(1, 1);

      const result = await updateAllTasks(
        MOCK_MIA_TASKS,
        tfmTaskUpdate.groupId,
        tfmTaskUpdate,
        MOCK_DEAL_MIA_SUBMITTED,
      );

      const expected = MOCK_MIA_TASKS.map((group) => ({
        ...group,
        groupTasks: group.groupTasks.map((task) => {
          let isTaskThatIsBeingUpdated = false;
          if (group.id === 1 && task.id === '1') {
            isTaskThatIsBeingUpdated = true;
          }

          const { updatedTask } = handleTaskEditFlagAndStatus(
            MOCK_MIA_TASKS,
            group,
            task,
            isTaskThatIsBeingUpdated,
          );

          return updatedTask;
        }),
      }));

      expect(result).toEqual(expected);
    });

    describe('when adverse history task is complete', () => {
      const mockTasks = MOCK_GROUP1;

      const tasksWithAdverseHistoryTaskComplete = mockTasks;

      // mark all tasks in group 1 as complete
      const group1 = tasksWithAdverseHistoryTaskComplete[0];
      tasksWithAdverseHistoryTaskComplete[0] = {
        ...group1,
        groupTasks: group1.groupTasks.map((task) => ({
          ...task,
          status: 'Done',
        })),
      };

      // mark all tasks in group 2 as complete
      const group2 = tasksWithAdverseHistoryTaskComplete[1];
      tasksWithAdverseHistoryTaskComplete[1] = {
        ...group2,
        groupTasks: group2.groupTasks.map((task) => ({
          ...task,
          status: 'Done',
        })),
      };

      it('should unlock all tasks in the Underwriting group', async () => {
        const tfmTaskUpdate = createTaskUpdateObj(2, 1);

        const result = await updateAllTasks(
          tasksWithAdverseHistoryTaskComplete,
          tfmTaskUpdate.groupId,
          tfmTaskUpdate,
          MOCK_DEAL_MIA_SUBMITTED,
        );

        const underwritingGroup = result.find((group) =>
          group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING);

        expect(underwritingGroup.groupTasks[0].status).toEqual('To do');
        expect(underwritingGroup.groupTasks[0].canEdit).toEqual(true);

        expect(underwritingGroup.groupTasks[1].status).toEqual('To do');
        expect(underwritingGroup.groupTasks[1].canEdit).toEqual(true);
        
        expect(underwritingGroup.groupTasks[2].status).toEqual('To do');
        expect(underwritingGroup.groupTasks[2].canEdit).toEqual(true);
      });
    });
  });

  describe('updateTfmTask', () => {
    const mockUser = MOCK_USERS[0];
    const userId = mockUser._id;
    const { firstName, lastName } = mockUser;

    it('should return the updated task', async () => {
      const dealId = MOCK_DEAL_MIA_SUBMITTED._id;

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
        title: MOCK_MIA_TASKS[0].groupTasks[0].title,
        groupId: MOCK_MIA_TASKS[0].id,
        assignedTo: {
          userId: tfmTaskUpdate.assignedTo.userId,
          userFullName: `${firstName} ${lastName}`,
        },
        team: MOCK_MIA_TASKS[0].groupTasks[0].team,
        previousStatus: 'To do',
        status: tfmTaskUpdate.status,
        lastEdited: expect.any(Number),
        dateStarted: expect.any(Number),
        dateCompleted: expect.any(Number),
      };

      expect(result).toEqual(expectedUpdatedTask);
    });

    describe('when task cannot be updated', () => {
      it('should return the original task', async () => {
        // MOCK_AIN_TASKS (that gets stubbed in api tests)
        // has task #1 as 'To do'.
        // therefore task #2 cannot be updated.

        const dealId = MOCK_DEAL_AIN_SUBMITTED._id;

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
        const dealId = MOCK_DEAL_MIA_SUBMITTED._id;

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
        const dealId = MOCK_DEAL_MIA_SUBMITTED._id;

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

    describe('api call', () => {
      const updateDealSpy = jest.fn(() => Promise.resolve({}));
      const findUserByIdSpy = jest.fn(() => Promise.resolve(MOCK_USERS[0]));

      beforeEach(() => {
        api.updateDeal = updateDealSpy;
        api.findUserById = findUserByIdSpy;
      });

      it('should call api.updateDeal', async () => {
        const dealId = MOCK_DEAL_AIN_SUBMITTED._id;

        const tfmTaskUpdate = createTaskUpdateObj(1, 1);

        await updateTfmTask(dealId, tfmTaskUpdate);

        const mappedTaskObj = await mapTaskObject(
          MOCK_AIN_TASKS[0].groupTasks[0],
          tfmTaskUpdate,
        );

        expect(updateDealSpy).toHaveBeenCalled();

        expect(updateDealSpy.mock.calls[0][0]).toEqual(dealId);

        // check first task in history.tasks array
        const firstTaskInHistorySentToUpdateDealSpy = updateDealSpy.mock.calls[0][1].tfm.history.tasks[0];

        expect(firstTaskInHistorySentToUpdateDealSpy.taskId).toEqual(tfmTaskUpdate.id);
        expect(firstTaskInHistorySentToUpdateDealSpy.groupId).toEqual(tfmTaskUpdate.groupId);
        expect(firstTaskInHistorySentToUpdateDealSpy.statusFrom).toEqual('To do');
        expect(firstTaskInHistorySentToUpdateDealSpy.statusTo).toEqual(tfmTaskUpdate.status);
        expect(firstTaskInHistorySentToUpdateDealSpy.assignedUserId).toEqual(tfmTaskUpdate.assignedTo.userId);
        expect(firstTaskInHistorySentToUpdateDealSpy.updatedBy).toEqual(tfmTaskUpdate.updatedBy);
        expect(typeof firstTaskInHistorySentToUpdateDealSpy.timestamp).toEqual('number');

        // check first task in tasks array
        const firstTaskSentToUpdateDealSpy = updateDealSpy.mock.calls[0][1].tfm.tasks[0].groupTasks[0];

        expect(firstTaskSentToUpdateDealSpy.id).toEqual(mappedTaskObj.id);
        expect(firstTaskSentToUpdateDealSpy.groupId).toEqual(mappedTaskObj.groupId);
        expect(firstTaskSentToUpdateDealSpy.status).toEqual(mappedTaskObj.status);
        expect(firstTaskSentToUpdateDealSpy.previousStatus).toEqual(mappedTaskObj.previousStatus);
        expect(firstTaskSentToUpdateDealSpy.assignedTo).toEqual(mappedTaskObj.assignedTo);
        expect(typeof firstTaskSentToUpdateDealSpy.dateCompleted).toEqual('number');
        expect(typeof firstTaskSentToUpdateDealSpy.dateStarted).toEqual('number');
        expect(typeof firstTaskSentToUpdateDealSpy.lastEdited).toEqual('number');
      });
    });
  });
});
