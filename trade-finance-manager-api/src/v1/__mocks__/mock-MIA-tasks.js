const CONSTANTS = require('../../constants');

const MOCK_MIA_TASKS = [
  {
    groupTitle: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.GROUP_TITLE,
    id: 1,
    groupTasks: [
      {
        id: '1',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
      },
      {
        id: '2',
        groupId: 1,
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
      },
      {
        id: '3',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
      },
      {
        id: '4',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        team: CONSTANTS.TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        id: '5',
        groupId: 1,
        title: CONSTANTS.TASKS.MIA_GROUP_1_TASKS.ASSIGN_AN_UNDERWRITER,
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
  {
    groupTitle: 'Adverse history check',
    id: 2,
    groupTasks: [
      {
        id: '1',
        groupId: 2,
        title: CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
  {
    groupTitle: 'Underwriting',
    id: 3,
    groupTasks: [
      {
        id: '1',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: CONSTANTS.TEAMS.UNDERWRITERS,
      },
      {
        id: '2',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: CONSTANTS.TEAMS.UNDERWRITERS,
      },
      {
        id: '3',
        groupId: 3,
        title: CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: CONSTANTS.TEAMS.UNDERWRITERS,
      },
    ],
  },
  {
    groupTitle: 'Approvals',
    id: 4,
    groupTasks: [
      {
        id: '1',
        groupId: 4,
        title: 'Check the credit analysis',
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        id: '2',
        groupId: 4,
        title: 'Complete risk analysis (RAD)',
        team: CONSTANTS.TEAMS.RISK_MANAGERS,
      },
      {
        id: '3',
        groupId: 4,
        title: 'Approve or decline the deal',
        team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
];

module.exports = MOCK_MIA_TASKS;
