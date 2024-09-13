const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const app = require('../../../src/createApp');
const { createApi } = require('../../api');
const testUserCache = require('../../api-test-users');
const MOCK_DEAL_MIA_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');
const MOCK_MIA_TASKS = require('../../../src/v1/__mocks__/mock-MIA-tasks');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');
const CONSTANTS = require('../../../src/constants');
const { mockFindOneDeal, mockUpdateDeal, mockFindUserById, mockFindOneDealFailure, mockFindOneTeam } = require('../../../src/v1/__mocks__/common-api-mocks');

const { as, put } = createApi(app);

describe('PUT /deals/:dealId/tasks/:groupId/:taskId', () => {
  const mockUser = MOCK_USERS[0];
  const { firstName, lastName } = mockUser;
  const userId = mockUser._id;
  const taskDealId = '61f6b18502fade01b1e8f07f';

  const groupId = MOCK_MIA_TASKS[0].id;
  const task = MOCK_MIA_TASKS[0].groupTasks[0];
  const taskId = task.id;
  const taskUpdateBase = {
    id: taskId,
    groupId,
    assignedTo: {
      userId,
    },
    updatedBy: userId,
  };

  const taskUpdate = {
    ...taskUpdateBase,
    status: CONSTANTS.TASKS.STATUS.COMPLETED,
  };

  const validUrlToUpdateTask = `/v1/deals/${taskDealId}/tasks/${groupId}/${taskId}`;

  let tokenUser;

  beforeAll(async () => {
    tokenUser = await testUserCache.initialise(app);
  });

  withClientAuthenticationTests({
    makeRequestWithoutAuthHeader: () => put(validUrlToUpdateTask, taskUpdate),
    makeRequestWithAuthHeader: (authHeader) => put(validUrlToUpdateTask, taskUpdate, { headers: { Authorization: authHeader } }),
  });

  it('returns a 200 if updateTfmTask is successful', async () => {
    mockFindOneDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockUpdateDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockFindOneTeam();
    mockFindUserById();

    const { status, body } = await as(tokenUser).put(taskUpdate).to(validUrlToUpdateTask);
    const expectedUpdatedTask = {
      id: taskId,
      title: MOCK_MIA_TASKS[0].groupTasks[0].title,
      groupId,
      assignedTo: {
        userId: taskUpdate.assignedTo.userId,
        userFullName: `${firstName} ${lastName}`,
      },
      team: MOCK_MIA_TASKS[0].groupTasks[0].team,
      previousStatus: CONSTANTS.TASKS.STATUS.TO_DO,
      status: taskUpdate.status,
      updatedAt: expect.any(Number),
      dateStarted: expect.any(Number),
      dateCompleted: expect.any(Number),
      history: expect.any(Array),
    };

    expect(status).toBe(200);
    expect(body).toEqual(expectedUpdatedTask);
  });

  it('returns a 400 if deal id is invalid', async () => {
    mockFindOneDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockUpdateDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockFindOneTeam();
    mockFindUserById();

    const invalidDealId = 'invalid-deal-id';
    const { status, body } = await as(tokenUser).put(taskUpdate).to(`/v1/deals/${invalidDealId}/tasks/${groupId}/${taskId}`);

    expect(status).toBe(400);
    expect(body).toEqual({
      errors: [
        {
          location: 'params',
          msg: 'The Deal ID (dealId) provided should be a Mongo ID',
          path: 'dealId',
          type: 'field',
          value: 'invalid-deal-id',
        },
      ],
      status: 400,
    });
  });

  it('returns a 400 if group id is invalid', async () => {
    mockFindOneDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockUpdateDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockFindOneTeam();
    mockFindUserById();

    const invalidGroupId = 'invalid-group-id';
    const { status, body } = await as(tokenUser).put(taskUpdate).to(`/v1/deals/${taskDealId}/tasks/${invalidGroupId}/${taskId}`);

    expect(status).toBe(400);
    expect(body).toEqual({
      errors: [
        {
          location: 'params',
          msg: 'The Group ID (groupId) provided should be an integer',
          path: 'groupId',
          type: 'field',
          value: 'invalid-group-id',
        },
      ],
      status: 400,
    });
  });

  it('returns a 400 if task id is invalid', async () => {
    mockFindOneDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockUpdateDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockFindOneTeam();
    mockFindUserById();

    const invalidTaskId = 'invalid-task-id';
    const { status, body } = await as(tokenUser).put(taskUpdate).to(`/v1/deals/${taskDealId}/tasks/${groupId}/${invalidTaskId}`);

    expect(status).toBe(400);
    expect(body).toEqual({
      errors: [
        {
          location: 'params',
          msg: 'The Task ID (taskId) provided should be an integer',
          path: 'taskId',
          type: 'field',
          value: 'invalid-task-id',
        },
      ],
      status: 400,
    });
  });

  it('returns a 500 if an error is thrown', async () => {
    mockFindOneDealFailure();
    mockUpdateDeal(MOCK_DEAL_MIA_SUBMITTED);
    mockFindOneTeam();
    mockFindUserById();

    const { status, body } = await as(tokenUser).put(taskUpdate).to(validUrlToUpdateTask);

    expect(status).toBe(500);
    expect(body).toEqual({ data: 'Unable to update the task' });
  });
});
