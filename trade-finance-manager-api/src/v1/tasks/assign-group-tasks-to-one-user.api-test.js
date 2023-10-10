const assignGroupTasksToOneUser = require('./assign-group-tasks-to-one-user');

const MOCK_USERS = require('../__mocks__/mock-users');
const MOCK_MIA_TASKS = require('../__mocks__/mock-MIA-tasks');
const MOCK_MIA_SECOND_SUBMIT = require('../__mocks__/mock-deal-MIA-second-submit');

const CONSTANTS = require('../../constants');
const {
  mockFindOneDeal,
  mockFindUserById,
  mockUpdateDeal,
  mockUpdateDealFailureWith500Status,
  mockFindOneDealFailure,
} = require('../__mocks__/common-api-mocks');
const api = require('../api');

describe('assignGroupTasksToOneUser', () => {
  beforeEach(() => {
    api.findOneDeal.mockReset();
    api.findUserById.mockReset();
    api.updateDeal.mockReset();

    mockFindUserById();
  });

  afterAll(() => {
    api.findOneDeal.mockReset();
    api.findUserById.mockReset();
    api.updateDeal.mockReset();
  });

  it('should assign all tasks in a group to the given user', async () => {
    mockUpdateDeal();
    mockFindOneDeal();

    const dealId = MOCK_MIA_SECOND_SUBMIT._id;

    const groupTitlesToAssign = [CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE, CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE];

    const mockUser = MOCK_USERS.find((u) => u.username === 'UNDERWRITER_MANAGER_1');
    const userId = mockUser._id;

    const tasksThatShouldBeUpdated = [];

    MOCK_MIA_TASKS.forEach((group) => {
      group.groupTasks.forEach((task) => {
        if (groupTitlesToAssign.includes(group.groupTitle)) {
          tasksThatShouldBeUpdated.push(task);
        }
      });
    });

    const result = await assignGroupTasksToOneUser(dealId, groupTitlesToAssign, userId);

    let filteredTasksResult = [];

    result.forEach((group) => {
      group.groupTasks.forEach((task) => {
        if (groupTitlesToAssign.includes(group.groupTitle)) {
          filteredTasksResult = [...filteredTasksResult, task];
        }
      });
    });

    const expected = tasksThatShouldBeUpdated.map((task) => ({
      ...task,
      assignedTo: {
        userId,
        userFullName: `${mockUser.firstName} ${mockUser.lastName}`,
      },
    }));

    expect(filteredTasksResult).toEqual(expected);
  });

  it('should throw an error if update deal fails', async () => {
    mockUpdateDealFailureWith500Status();
    mockFindOneDeal();

    const dealId = MOCK_MIA_SECOND_SUBMIT._id;

    const groupTitlesToAssign = [CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE, CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE];

    const mockUser = MOCK_USERS.find((u) => u.username === 'UNDERWRITER_MANAGER_1');
    const userId = mockUser._id;

    await expect(assignGroupTasksToOneUser(dealId, groupTitlesToAssign, userId)).rejects.toThrow(Error);
  });

  it('should throw an error if find deal fails', async () => {
    mockUpdateDeal();
    mockFindOneDealFailure();

    const dealId = MOCK_MIA_SECOND_SUBMIT._id;

    const groupTitlesToAssign = [CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE, CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE];

    const mockUser = MOCK_USERS.find((u) => u.username === 'UNDERWRITER_MANAGER_1');
    const userId = mockUser._id;

    await expect(assignGroupTasksToOneUser(dealId, groupTitlesToAssign, userId)).rejects.toThrow(Error);
  });
});
