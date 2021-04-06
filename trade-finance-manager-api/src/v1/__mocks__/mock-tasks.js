const CONSTANTS = require('../../constants');

const MOCK_TASKS = [
  {
    groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
    groupTasks: [
      {
        id: '1',
        title: CONSTANTS.TASKS.AIN.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        title: CONSTANTS.TASKS.AIN.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
];

module.exports = MOCK_TASKS;
