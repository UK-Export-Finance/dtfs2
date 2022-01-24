const mapTaskObject = require('./map-task-object');
const api = require('../api');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_MIA_TASKS = require('../__mocks__/mock-MIA-tasks');

const underwriterManagerUser = MOCK_USERS.find((u) => u.username === 'UNDERWRITER_MANAGER_1');

const findUserByIdApiSpy = jest.fn(() => Promise.resolve(
  underwriterManagerUser,
));

describe('mapTaskObject', () => {
  beforeEach(() => {
    api.findUserById = findUserByIdApiSpy;
  });

  afterEach(() => {
    api.findUserById.mockClear();
  });

  it('should return mapped object with full assignee name and updatedAt timestamp', async () => {
    const originalTask = MOCK_MIA_TASKS[0].groupTasks[0];

    const updateInput = {
      id: originalTask.id,
      groupId: originalTask.groupId,
      assignedTo: {
        userId: underwriterManagerUser._id,
      },
      status: 'Some new status',
      updatedBy: underwriterManagerUser._id,
      urlOrigin: 'test.com',
    };

    const result = await mapTaskObject(originalTask, updateInput);

    const expected = {
      ...originalTask,
      id: updateInput.id,
      groupId: updateInput.groupId,
      status: updateInput.status,
      previousStatus: originalTask.status,
      assignedTo: {
        userFullName: `${underwriterManagerUser.firstName} ${underwriterManagerUser.lastName}`,
        userId: updateInput.assignedTo.userId,
      },
    };

    const { updatedAt, ...resultWithoutUpdatedAt } = result;

    expect(resultWithoutUpdatedAt).toEqual(expected);

    expect(typeof updatedAt).toEqual('number');
  });
});
