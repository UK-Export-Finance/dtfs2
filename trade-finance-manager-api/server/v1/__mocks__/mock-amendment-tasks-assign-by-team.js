const { ObjectId } = require('mongodb');

const { getUnixTime } = require('date-fns');
const { TEAMS } = require('../../constants');
const MOCK_USERS = require('./mock-users');
const { MOCK_BSS_EWCS_DEAL } = require('./mock-deal');

const underwriter = MOCK_USERS.find((user) => user.teams.includes(TEAMS.UNDERWRITERS.id));
const underwriterManager = MOCK_USERS.find((user) => user.teams.includes(TEAMS.UNDERWRITER_MANAGERS.id));

underwriter.fullname = `${underwriter.firstName} ${underwriter.lastName}`;
underwriterManager.fullname = `${underwriterManager.firstName} ${underwriterManager.lastName}`;

const MOCK_TASKS_CHANGE_TIME = getUnixTime(new Date());

const MOCK_TASKS = [
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'PIM',
          name: 'Post issue management',
        },
        assignedTo: {
          userFullName: 'Caroline-Test O’Test Taylor',
          userId: '65af9a9220383984736e9fac',
        },
        updatedAt: 1714490806519,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 2, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
    ],
  },
  {
    groupTitle: 'Underwriters 1, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
    ],
  },
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 1',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITER_MANAGERS',
          name: 'Underwriter managers',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
    ],
  },
];

const TASKS_ASSIGNED_TO_UNDERWRITER = [
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'PIM',
          name: 'Post issue management',
        },
        assignedTo: {
          userFullName: 'Caroline-Test O’Test Taylor',
          userId: '65af9a9220383984736e9fac',
        },
        updatedAt: 1714490806519,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 2, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: underwriter._id,
          userFullName: underwriter.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: underwriter._id,
          userFullName: underwriter.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 1, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: underwriter._id,
          userFullName: underwriter.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 1',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITER_MANAGERS',
          name: 'Underwriter managers',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
    ],
  },
];

const TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER = [
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'PIM',
          name: 'Post issue management',
        },
        assignedTo: {
          userFullName: 'Caroline-Test O’Test Taylor',
          userId: '65af9a9220383984736e9fac',
        },
        updatedAt: 1714490806519,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 2, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
    ],
  },
  {
    groupTitle: 'Underwriters 1, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
      },
    ],
  },
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 1',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITER_MANAGERS',
          name: 'Underwriter managers',
        },
        assignedTo: {
          userId: underwriterManager._id,
          userFullName: underwriterManager.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
];

const TASKS_ASSIGNED_TO_UNDERWRITER_AND_UNDERWRITER_MANAGER = [
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'PIM',
          name: 'Post issue management',
        },
        assignedTo: {
          userFullName: 'Caroline-Test O’Test Taylor',
          userId: '65af9a9220383984736e9fac',
        },
        updatedAt: 1714490806519,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 2, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: underwriter._id,
          userFullName: underwriter.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: underwriter._id,
          userFullName: underwriter.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 1, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: underwriter._id,
          userFullName: underwriter.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 1',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITER_MANAGERS',
          name: 'Underwriter managers',
        },
        assignedTo: {
          userId: underwriterManager._id,
          userFullName: underwriterManager.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
];

const TASKS_UNASSIGNED_FOR_UNDERWRITER = [
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'PIM',
          name: 'Post issue management',
        },
        assignedTo: {
          userFullName: 'Caroline-Test O’Test Taylor',
          userId: '65af9a9220383984736e9fac',
        },
        updatedAt: 1714490806519,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 2, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 1, Underwriter Managers 0',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITERS',
          name: 'Underwriters',
        },
        assignedTo: {
          userId: 'Unassigned',
          userFullName: 'Unassigned',
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
  {
    groupTitle: 'Underwriters 0, Underwriter Managers 1',
    groupTasks: [
      {
        team: {
          id: 'UNDERWRITER_MANAGERS',
          name: 'Underwriter managers',
        },
        assignedTo: {
          userId: underwriterManager._id,
          userFullName: underwriterManager.fullname,
        },
        updatedAt: MOCK_TASKS_CHANGE_TIME,
      },
    ],
  },
];

const TASKS_UPDATE_MOCK_REQUEST = {
  params: {
    _id: MOCK_BSS_EWCS_DEAL._id,
    facilityId: new ObjectId('6745bd3719238444fa59f308'),
    amendmentId: new ObjectId('6745bd3719238444fa59f307'),
    groupId: '1',
    taskId: '1',
  },
  user: MOCK_USERS,
  session: {
    user: underwriter,
    userToken: '',
  },
  headers: {
    origin: '',
  },
  body: {
    taskUpdate: {
      id: '1',
      groupId: 1,
      status: 'Done',
      assignedTo: { userId: underwriter._id },
      updatedBy: underwriter._id,
      urlOrigin: '',
      updateTask: true,
    },
  },
};

module.exports = {
  MOCK_USERS_FOR_TASKS: {
    underwriter,
    underwriterManager,
  },
  MOCK_TASKS,
  MOCK_TASKS_CHANGE_TIME,
  TASKS_ASSIGNED_TO_UNDERWRITER_MANAGER,
  TASKS_ASSIGNED_TO_UNDERWRITER_AND_UNDERWRITER_MANAGER,
  TASKS_ASSIGNED_TO_UNDERWRITER,
  TASKS_UNASSIGNED_FOR_UNDERWRITER,
  TASKS_UPDATE_MOCK_REQUEST,
};
