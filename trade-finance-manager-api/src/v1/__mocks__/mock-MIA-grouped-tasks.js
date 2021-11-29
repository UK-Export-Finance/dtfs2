const CONSTANTS = require('../../constants');

const MOCK_GROUP1 = [
  {
    groupTitle: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: [
      {
        id: '1',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },

      {
        id: '3',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: [
      {
        id: '1',
        groupId: 2,
        title: CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: [
      {
        id: '1',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: [
      {
        id: '1',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
];

const MOCK_GROUP2 = [
  {
    groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: [
      {
        id: '1',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: [
      {
        id: '1',
        groupId: 2,
        title: CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: [
      {
        id: '1',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: [
      {
        id: '1',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
];

const MOCK_GROUP3 = [
  {
    groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: [
      {
        id: '1',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: [
      {
        id: '1',
        groupId: 2,
        title: CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: [
      {
        id: '1',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: [
      {
        id: '1',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
];

const MOCK_GROUP4 = [
  {
    groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: [
      {
        id: '1',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.COMPLETED,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_2.GROUP_TITLE,
    id: 2,
    groupTasks: [
      {
        id: '1',
        groupId: 2,
        title: CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
        status: CONSTANTS.TASKS.STATUS.TO_DO,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_3.GROUP_TITLE,
    id: 3,
    groupTasks: [
      {
        id: '1',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '3',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
  {
    groupTitle: CONSTANTS.TASKS.MIA.GROUP_4.GROUP_TITLE,
    id: 4,
    groupTasks: [
      {
        id: '1',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
      {
        id: '2',
        groupId: 4,
        title: CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
        status: CONSTANTS.TASKS.STATUS.CANNOT_START,
        assignedTo: {
          userId: CONSTANTS.TASKS.UNASSIGNED,
          userFullName: CONSTANTS.TASKS.UNASSIGNED,
        },
      },
    ],
  },
];

exports.MOCK_GROUP1 = MOCK_GROUP1;
exports.MOCK_GROUP2 = MOCK_GROUP2;
exports.MOCK_GROUP3 = MOCK_GROUP3;
exports.MOCK_GROUP4 = MOCK_GROUP4;
