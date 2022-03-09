const {
  updateTask,
  updateAllTasks,
  updateTfmTask,
} = require('./tasks.controller');
const { handleTaskEditFlagAndStatus } = require('../tasks/tasks-edit-logic');
const mapTaskObject = require('../tasks/map-task-object');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');

const api = require('../api');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_AIN_TASKS = require('../__mocks__/mock-AIN-tasks');
const MOCK_MIA_TASKS = require('../__mocks__/mock-MIA-tasks');
const MOCK_MIA_TASKS_POPULATED = require('../__mocks__/mock-MIA-tasks-populated');
const MOCK_DEAL_AIN_SUBMITTED = require('../__mocks__/mock-deal-AIN-submitted');
const MOCK_TEAMS = require('../__mocks__/mock-teams');

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
      const mockUrlOrigin = 'http://test.com';
      const mockTasks = MOCK_MIA_TASKS_POPULATED;

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
          mockUrlOrigin,
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

      it('should send an email for every unlocked task in the Underwriting group', async () => {
        const tfmTaskUpdate = createTaskUpdateObj(2, 1);

        const result = await updateAllTasks(
          tasksWithAdverseHistoryTaskComplete,
          tfmTaskUpdate.groupId,
          tfmTaskUpdate,
          MOCK_DEAL_MIA_SUBMITTED,
          mockUrlOrigin,
        );

        expect(api.sendEmail).toHaveBeenCalled();

        const underwritingGroup = result.find((group) =>
          group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING);

        const underwritingTeamEmail = MOCK_TEAMS.find((team) => team.id === CONSTANTS.TEAMS.UNDERWRITERS.id).email;

        const firstUnderwritingTask = underwritingGroup.groupTasks[0];
        const secondUnderwritingTask = underwritingGroup.groupTasks[1];
        const thirdUnderwritingTask = underwritingGroup.groupTasks[2];

        const firstCall = api.sendEmail.mock.calls[0];
        const secondCall = api.sendEmail.mock.calls[1];
        const thirdCall = api.sendEmail.mock.calls[2];

        const generatedExpectedCall = (task) => [
          CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
          underwritingTeamEmail,
          generateTaskEmailVariables(
            mockUrlOrigin,
            task,
            MOCK_DEAL_MIA_SUBMITTED._id,
            MOCK_DEAL_MIA_SUBMITTED.exporter.companyName,
          ),
        ];

        const expectedFirstCall = generatedExpectedCall(firstUnderwritingTask);
        expect(firstCall).toEqual(expectedFirstCall);

        const expectedSecondCall = generatedExpectedCall(secondUnderwritingTask);
        expect(secondCall).toEqual(expectedSecondCall);

        const expectedThirdCall = generatedExpectedCall(thirdUnderwritingTask);
        expect(thirdCall).toEqual(expectedThirdCall);
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
        updatedAt: expect.any(Number),
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

        // check first task in tasks array
        const firstTaskSentToUpdateDealSpy = updateDealSpy.mock.calls[0][1].tfm.tasks[0].groupTasks[0];

        expect(firstTaskSentToUpdateDealSpy.id).toEqual(mappedTaskObj.id);
        expect(firstTaskSentToUpdateDealSpy.groupId).toEqual(mappedTaskObj.groupId);
        expect(firstTaskSentToUpdateDealSpy.status).toEqual(mappedTaskObj.status);
        expect(firstTaskSentToUpdateDealSpy.previousStatus).toEqual(mappedTaskObj.previousStatus);
        expect(firstTaskSentToUpdateDealSpy.assignedTo).toEqual(mappedTaskObj.assignedTo);
        expect(typeof firstTaskSentToUpdateDealSpy.dateCompleted).toEqual('number');
        expect(typeof firstTaskSentToUpdateDealSpy.dateStarted).toEqual('number');
        expect(typeof firstTaskSentToUpdateDealSpy.updatedAt).toEqual('number');
      });
    });
  });
});
