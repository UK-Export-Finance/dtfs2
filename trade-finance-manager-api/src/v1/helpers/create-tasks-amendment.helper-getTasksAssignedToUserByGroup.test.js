const { getTasksAssignedToUserByGroup } = require('./create-tasks-amendment.helper');
const { TEAMS, TASKS } = require('../../constants');

const api = require('../api');
const { mockFindUserById } = require('../__mocks__/common-api-mocks');
const {
  MOCK_USERS_FOR_TASKS,
  MOCK_TASKS,
  TASKS_ASSIGNED_TO_UNDERWRITER,
  TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER,
  TASKS_ASSIGNED_TO_UNDERWRITER_AND_UNDERWRITER_MANAGER,
  TASKS_UNASSIGNED_FOR_UNDERWRITER,
  MOCK_TASKS_CHANGE_TIME,
} = require('../__mocks__/mock-amendment-tasks-assign-by-team');

jest.mock('../api');

describe('getTasksAssignedToUserByGroup()', () => {
  const { underwriter, underwriterManager } = MOCK_USERS_FOR_TASKS;

  beforeEach(() => {
    api.findUserById.mockReset();
    mockFindUserById();

    jest.useFakeTimers();
    jest.setSystemTime(MOCK_TASKS_CHANGE_TIME * 1000); // Tuesday, December 23, 2008 2:40:00 AM GMT
  });

  it('should assign tasks to Underwriter', async () => {
    const response = await getTasksAssignedToUserByGroup(MOCK_TASKS, TEAMS.UNDERWRITERS.id, underwriter._id);

    expect(response).toEqual(TASKS_ASSIGNED_TO_UNDERWRITER);
  });

  it('should assign tasks to UnderwriterManager', async () => {
    const response = await getTasksAssignedToUserByGroup(
      MOCK_TASKS,
      TEAMS.UNDERWRITER_MANAGERS.id,
      underwriterManager._id,
    );

    expect(response).toEqual(TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER);
  });

  it('should assign tasks to Underwriter and UnderwriterManager', async () => {
    const assignedToUnderwriter = await getTasksAssignedToUserByGroup(
      MOCK_TASKS,
      TEAMS.UNDERWRITERS.id,
      underwriter._id,
    );
    const finalResponse = await getTasksAssignedToUserByGroup(
      assignedToUnderwriter,
      TEAMS.UNDERWRITER_MANAGERS.id,
      underwriterManager._id,
    );

    expect(finalResponse).toEqual(TASKS_ASSIGNED_TO_UNDERWRITER_AND_UNDERWRITER_MANAGER);
  });

  it('should unassign tasks previously assigned to Underwriter', async () => {
    const finalResponse = await getTasksAssignedToUserByGroup(
      TASKS_ASSIGNED_TO_UNDERWRITER_AND_UNDERWRITER_MANAGER,
      TEAMS.UNDERWRITERS.id,
      TASKS.UNASSIGNED,
    );

    expect(finalResponse).toEqual(TASKS_UNASSIGNED_FOR_UNDERWRITER);
  });
});
