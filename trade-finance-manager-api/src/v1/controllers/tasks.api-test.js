const { generateTfmAuditDetails } = require('@ukef/dtfs2-common');
const { createUpdatedTask, createAllUpdatedTasks, updateTfmTask } = require('./tasks.controller');
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
const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');
const CONSTANTS = require('../../constants');
const { mockUpdateDeal, mockFindOneDeal, mockFindUserById, mockFindOneTeam } = require('../__mocks__/common-api-mocks');

const taskUpdateBase = {
  assignedTo: {
    userId: MOCK_USERS[0]._id,
    userFullName: `${MOCK_USERS[0].firstName} ${MOCK_USERS[0].lastName}`,
  },
  status: CONSTANTS.TASKS.STATUS.COMPLETED,
  updatedBy: MOCK_USERS[0]._id,
};

const createTaskUpdateObj = (groupId, taskId) => ({
  ...taskUpdateBase,
  id: String(taskId),
  groupId,
});

const mockUrlOrigin = 'http://test.com';

const sendEmailApiSpy = jest.fn(() => Promise.resolve(MOCK_NOTIFY_EMAIL_RESPONSE));

describe('tasks controller', () => {
  beforeEach(() => {
    api.sendEmail.mockClear();
    api.sendEmail = sendEmailApiSpy;

    api.updateDeal.mockReset();
    mockUpdateDeal();

    api.findOneDeal.mockReset();
    mockFindOneDeal();

    api.findUserById.mockReset();
    mockFindUserById();

    api.findOneTeam.mockReset();
    mockFindOneTeam();
  });

  describe('createUpdatedTask', () => {
    it('should update a single task in a group', () => {
      const mockGroup1Tasks = [
        {
          id: '1',
          groupId: 1,
          status: CONSTANTS.TASKS.STATUS.COMPLETED,
          history: [],
        },
        {
          id: '2',
          groupId: 1,
          status: CONSTANTS.TASKS.STATUS.IN_PROGRESS,
          history: [],
        },
        {
          id: '3',
          groupId: 1,
          status: CONSTANTS.TASKS.STATUS.TO_DO,
          history: [],
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

      const taskUpdate = {
        id: '2',
        groupId: 1,
        status: 'Done',
        assignedTo: {
          userFullName: 'Test Name',
          userId: '123456',
        },
      };

      const result = createUpdatedTask(mockTasks, taskUpdate);

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

  describe('createAllUpdatedTasks', () => {
    it('should map over all tasks and return handleTaskEditFlagAndStatus for each task', async () => {
      const tfmTaskUpdate = createTaskUpdateObj(1, 1);

      const result = await createAllUpdatedTasks(MOCK_MIA_TASKS, tfmTaskUpdate.groupId, tfmTaskUpdate, CONSTANTS.TASKS.STATUS.TO_DO, MOCK_DEAL_MIA_SUBMITTED);

      const expected = MOCK_MIA_TASKS.map((group) => ({
        ...group,
        groupTasks: group.groupTasks.map((task) => {
          let isTaskThatIsBeingUpdated = false;
          if (group.id === 1 && task.id === '1') {
            isTaskThatIsBeingUpdated = true;
          }

          const { updatedTask } = handleTaskEditFlagAndStatus(MOCK_MIA_TASKS, group, task, isTaskThatIsBeingUpdated);

          return updatedTask;
        }),
      }));

      expect(result).toEqual(expected);
    });

    describe('when adverse history task is complete', () => {
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

      it('should unlock all tasks in the Underwriting group and send an email for every unlocked task in the Underwriting group', async () => {
        const tfmTaskUpdate = createTaskUpdateObj(2, 1);

        const result = await createAllUpdatedTasks(
          tasksWithAdverseHistoryTaskComplete,
          tfmTaskUpdate.groupId,
          tfmTaskUpdate,
          CONSTANTS.TASKS.STATUS.TO_DO,
          MOCK_DEAL_MIA_SUBMITTED,
          mockUrlOrigin,
        );

        const underwritingGroup = result.find((group) => group.groupTitle === CONSTANTS.TASKS.GROUP_TITLES.UNDERWRITING);

        expect(underwritingGroup.groupTasks[0].status).toEqual(CONSTANTS.TASKS.STATUS.TO_DO);
        expect(underwritingGroup.groupTasks[0].canEdit).toEqual(true);

        expect(underwritingGroup.groupTasks[1].status).toEqual(CONSTANTS.TASKS.STATUS.TO_DO);
        expect(underwritingGroup.groupTasks[1].canEdit).toEqual(true);

        expect(underwritingGroup.groupTasks[2].status).toEqual(CONSTANTS.TASKS.STATUS.TO_DO);
        expect(underwritingGroup.groupTasks[2].canEdit).toEqual(true);

        expect(api.sendEmail).toHaveBeenCalled();

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
          generateTaskEmailVariables(mockUrlOrigin, task, MOCK_DEAL_MIA_SUBMITTED._id, MOCK_DEAL_MIA_SUBMITTED.exporter.companyName),
        ];

        const expectedFirstCall = generatedExpectedCall(firstUnderwritingTask);
        expect(firstCall).toEqual(expectedFirstCall);

        const expectedSecondCall = generatedExpectedCall(secondUnderwritingTask);
        expect(secondCall).toEqual(expectedSecondCall);

        const expectedThirdCall = generatedExpectedCall(thirdUnderwritingTask);
        expect(thirdCall).toEqual(expectedThirdCall);
      });
    });

    describe('when a task or tasks are unlocked', () => {
      it('should add emailSent flag to the tasks that have been unlocked and emails sent', async () => {
        const mockTasks = MOCK_MIA_TASKS_POPULATED;

        const tasksWithFirstGroupComplete = mockTasks;

        // mark all tasks in group 1 as complete
        const group1 = tasksWithFirstGroupComplete[0];
        tasksWithFirstGroupComplete[0] = {
          ...group1,
          groupTasks: group1.groupTasks.map((task) => ({
            ...task,
            status: 'Done',
          })),
        };

        // complete the only task in group 2 - therefore unlocking group 3 tasks.
        const tfmTaskUpdate = createTaskUpdateObj(2, 1);

        const result = await createAllUpdatedTasks(
          tasksWithFirstGroupComplete,
          tfmTaskUpdate.groupId,
          tfmTaskUpdate,
          CONSTANTS.TASKS.STATUS.TO_DO,
          MOCK_DEAL_MIA_SUBMITTED,
          mockUrlOrigin,
        );

        // all tasks in group 3 (Underwriting group tasks) are now unlocked
        // emailSent flag should be added;
        const group3TasksAfterUpdate = result[2].groupTasks;
        expect(group3TasksAfterUpdate[0].emailSent).toEqual(true);
        expect(group3TasksAfterUpdate[1].emailSent).toEqual(true);
        expect(group3TasksAfterUpdate[2].emailSent).toEqual(true);
      });
    });

    describe('when all Underwriting group tasks are already unlocked', () => {
      it('should not send an email for any Underwriting group tasks (emails are sent when unlocked)', async () => {
        const tfmTaskUpdate = createTaskUpdateObj(3, 1);

        const mockTasks = MOCK_MIA_TASKS_POPULATED;
        const underwritingTasks = mockTasks[2];

        const tasksWithUnderwritingTasksUnlocked = [
          {
            groupId: 1,
            groupTasks: [],
          },
          underwritingTasks,
        ];

        // mark all tasks in underwriting group as To do and emailSent
        tasksWithUnderwritingTasksUnlocked[1] = {
          ...underwritingTasks[1],
          groupTasks: underwritingTasks.groupTasks.map((task) => ({
            ...task,
            status: 'To do',
            emailSent: true,
          })),
        };

        await createAllUpdatedTasks(tasksWithUnderwritingTasksUnlocked, tfmTaskUpdate.groupId, tfmTaskUpdate, MOCK_DEAL_MIA_SUBMITTED, mockUrlOrigin);

        expect(api.sendEmail).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateTfmTask', () => {
    const mockUser = MOCK_USERS[0];
    const userId = mockUser._id;
    const { firstName, lastName } = mockUser;
    const groupId = MOCK_MIA_TASKS[0].id;

    const updatableTaskDealId = MOCK_DEAL_MIA_SUBMITTED._id;
    const updatableTask = MOCK_MIA_TASKS[0].groupTasks[0];
    const updatableTaskId = updatableTask.id;
    const updateableTaskUpdateBase = {
      id: updatableTaskId,
      groupId,
      assignedTo: {
        userId,
      },
      updatedBy: userId,
    };
    const updatableTaskUpdateDone = {
      ...updateableTaskUpdateBase,
      status: CONSTANTS.TASKS.STATUS.COMPLETED,
    };

    const updatableTaskUpdateToDo = {
      ...updateableTaskUpdateBase,
      status: CONSTANTS.TASKS.STATUS.TO_DO,
    };

    const updatableTaskUpdateInProgress = {
      ...updateableTaskUpdateBase,
      status: CONSTANTS.TASKS.STATUS.IN_PROGRESS,
    };

    // MOCK_AIN_TASKS (that gets stubbed in api tests)
    // has task #1 as 'To do'.
    // therefore task #2 cannot be updated.
    const unUpdateableTaskDealId = MOCK_DEAL_AIN_SUBMITTED._id;
    const unUpdateableTask = MOCK_AIN_TASKS[0].groupTasks[1];
    const unUpdateableTaskId = unUpdateableTask.id;
    const unUpdateableTaskUpdate = {
      id: unUpdateableTaskId,
      groupId,
      assignedTo: {
        userId,
      },
      status: 'In progress',
      updatedBy: userId,
    };

    it('should return the updated task', async () => {
      const result = await updateTfmTask({
        dealId: updatableTaskDealId,
        groupId,
        taskId: updatableTaskId,
        taskUpdate: updatableTaskUpdateDone,
        auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
      });

      const expectedUpdatedTask = {
        id: updatableTaskId,
        title: MOCK_MIA_TASKS[0].groupTasks[0].title,
        groupId,
        assignedTo: {
          userId: updatableTaskUpdateDone.assignedTo.userId,
          userFullName: `${firstName} ${lastName}`,
        },
        team: MOCK_MIA_TASKS[0].groupTasks[0].team,
        previousStatus: CONSTANTS.TASKS.STATUS.TO_DO,
        status: updatableTaskUpdateDone.status,
        updatedAt: expect.any(Number),
        dateStarted: expect.any(Number),
        dateCompleted: expect.any(Number),
        history: expect.any(Array),
      };

      expect(result).toEqual(expectedUpdatedTask);
    });

    describe('when findOneDeal returns false', () => {
      it('throws an error', async () => {
        const findOneDealMock = jest.fn(() => Promise.resolve(false));
        api.findOneDeal = findOneDealMock;

        await expect(
          updateTfmTask({
            dealId: updatableTaskDealId,
            groupId,
            taskId: updatableTaskId,
            taskUpdate: updatableTaskUpdateToDo,
            auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
          }),
        ).rejects.toThrowError(`Deal not found ${updatableTaskDealId}`);
      });
    });

    describe('when the group is not found', () => {
      it('throws an error', async () => {
        const nonExistantGroupId = 567;

        await expect(
          updateTfmTask({
            dealId: updatableTaskDealId,
            groupId: nonExistantGroupId,
            taskId: updatableTaskId,
            taskUpdate: updatableTaskUpdateToDo,
            auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
          }),
        ).rejects.toThrowError(`Group not found ${nonExistantGroupId}`);
      });
    });

    describe('when the task is not found', () => {
      it('throws an error', async () => {
        const nonExistantTaskId = 789;

        await expect(
          updateTfmTask({
            dealId: updatableTaskDealId,
            groupId,
            taskId: nonExistantTaskId,
            taskUpdate: updatableTaskUpdateToDo,
            auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
          }),
        ).rejects.toThrowError(`Task not found ${nonExistantTaskId}`);
      });
    });

    describe('when task cannot be updated', () => {
      it('should return the original task', async () => {
        const result = await updateTfmTask({
          dealId: unUpdateableTaskDealId,
          groupId,
          taskId: unUpdateableTaskId,
          taskUpdate: unUpdateableTaskUpdate,
          auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
        });

        expect(result).toEqual(unUpdateableTask);
      });
    });

    describe('when an MIA deal has the first task in the first group completed immediately', () => {
      it('should update deal.tfm.stage to `In progress`', async () => {
        await updateTfmTask({
          dealId: updatableTaskDealId,
          groupId,
          taskId: updatableTaskId,
          taskUpdate: updatableTaskUpdateDone,
          auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
        });

        const deal = await api.findOneDeal(updatableTaskDealId);

        expect(deal.tfm.stage).toEqual('In progress');
      });
    });

    describe('when an MIA deal has the first task in the first group completed after being `In progress`', () => {
      it('should update deal.tfm.stage to `In progress`', async () => {
        await updateTfmTask({
          dealId: updatableTaskDealId,
          groupId,
          taskId: updatableTaskId,
          taskUpdate: updatableTaskUpdateToDo,
          auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
        });

        await api.resetDealForApiTest(updatableTaskDealId);

        const initialDeal = await api.findOneDeal(updatableTaskDealId);

        expect(initialDeal.tfm.stage).toBeUndefined();

        await updateTfmTask({
          dealId: updatableTaskDealId,
          groupId,
          taskId: updatableTaskId,
          taskUpdate: updatableTaskUpdateInProgress,
          auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
        });

        const dealAfterFirstUpdate = await api.findOneDeal(updatableTaskDealId);

        expect(dealAfterFirstUpdate.tfm.stage).toEqual('In progress');

        await updateTfmTask({
          dealId: updatableTaskDealId,
          groupId,
          taskId: updatableTaskId,
          taskUpdate: updatableTaskUpdateDone,
          auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
        });

        const dealAfterSecondUpdate = await api.findOneDeal(updatableTaskDealId);

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

        await updateTfmTask({
          dealId,
          groupId: tfmTaskUpdate.groupId,
          taskId: tfmTaskUpdate.id,
          taskUpdate: tfmTaskUpdate,
          auditDetails: generateTfmAuditDetails(MOCK_USERS[0]._id),
        });

        const mappedTaskObj = await mapTaskObject(MOCK_AIN_TASKS[0].groupTasks[0], tfmTaskUpdate);

        expect(updateDealSpy).toHaveBeenCalled();

        expect(updateDealSpy.mock.calls[0][0].dealId).toEqual(dealId);

        // check first task in tasks array
        const firstTaskSentToUpdateDealSpy = updateDealSpy.mock.calls[0][0].dealUpdate.tfm.tasks[0].groupTasks[0];

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
