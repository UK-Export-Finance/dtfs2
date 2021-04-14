const CONSTANTS = require('../../constants');

const taskDefaults = () => ({
  status: CONSTANTS.TASKS.STATUS.TO_DO,
  assignedTo: {
    userId: CONSTANTS.TASKS.UNASSIGNED,
    userFullName: CONSTANTS.TASKS.UNASSIGNED,
  },
});

const TASKS = {
  AIN: [
    {
      groupTitle: CONSTANTS.TASKS.AIN.GROUP_1.GROUP_TITLE,
      id: 1,
      groupTasks: [
        {
          id: '1',
          groupId: 1,
          title: CONSTANTS.TASKS.AIN.GROUP_1.MATCH_OR_CREATE_PARTIES,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          ...taskDefaults(),
          canEdit: true,
        },
        {
          id: '2',
          groupId: 1,
          title: CONSTANTS.TASKS.AIN.GROUP_1.CREATE_OR_LINK_SALESFORCE,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          ...taskDefaults(),
        },
      ],
    },
  ],
  MIA: [
    {
      groupTitle: CONSTANTS.TASKS.MIA.GROUP_1.GROUP_TITLE,
      id: 1,
      groupTasks: [
        {
          id: '1',
          groupId: 1,
          title: CONSTANTS.TASKS.MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          ...taskDefaults(),
          canEdit: true,
        },
        {
          id: '2',
          groupId: 1,
          title: CONSTANTS.TASKS.MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
          team: CONSTANTS.TEAMS.BUSINESS_SUPPORT,
          ...taskDefaults(),
        },
        {
          id: '3',
          groupId: 1,
          title: CONSTANTS.TASKS.MIA.GROUP_1.FILE_ALL_DEAL_EMAILS,
          team: CONSTANTS.TEAMS.UNDERWRITING_SUPPORT,
          ...taskDefaults(),
        },
        {
          id: '4',
          groupId: 1,
          title: CONSTANTS.TASKS.MIA.GROUP_1.CREATE_CREDIT_ANALYSIS_DOCUMENT,
          team: CONSTANTS.TEAMS.UNDERWRITING_SUPPORT,
          ...taskDefaults(),
        },
        {
          id: '5',
          groupId: 1,
          title: CONSTANTS.TASKS.MIA.GROUP_1.ASSIGN_UNDERWRITER,
          team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
          ...taskDefaults(),
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
          title: CONSTANTS.TASKS.MIA.GROUP_2.COMPLETE_ADVERSE_HISTORY_CHECK,
          team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
          ...taskDefaults(),
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
          title: CONSTANTS.TASKS.MIA.GROUP_3.CHECK_EXPOSURE,
          team: CONSTANTS.TEAMS.UNDERWRITERS,
          ...taskDefaults(),
        },
        {
          id: '2',
          groupId: 3,
          title: CONSTANTS.TASKS.MIA.GROUP_3.GIVE_EXPORTER_CREDIT_RATING,
          team: CONSTANTS.TEAMS.UNDERWRITERS,
          ...taskDefaults(),
        },
        {
          id: '3',
          groupId: 3,
          title: CONSTANTS.TASKS.MIA.GROUP_3.COMPLETE_CREDIT_ANALYSIS,
          team: CONSTANTS.TEAMS.UNDERWRITERS,
          ...taskDefaults(),
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
          title: CONSTANTS.TASKS.MIA.GROUP_4.CHECK_CREDIT_ANALYSIS,
          team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
          ...taskDefaults(),
        },
        {
          id: '2',
          groupId: 4,
          title: CONSTANTS.TASKS.MIA.GROUP_4.COMPELTE_RISK_ANALYSIS,
          team: CONSTANTS.TEAMS.RISK_MANAGERS,
          ...taskDefaults(),
        },
        {
          id: '3',
          groupId: 4,
          title: CONSTANTS.TASKS.MIA.GROUP_4.APPROVE_OR_DECLINE_DEAL,
          team: CONSTANTS.TEAMS.UNDERWRITER_MANAGERS,
          ...taskDefaults(),
        },
      ],
    },
  ]
};

const HISTORY = {
  tasks: [],
};

const CREDIT_RATING = {
  AIN: CONSTANTS.DEALS.CREDIT_RATING.ACCEPTABLE,
};

const FACILITY_RISK_PROFILE = CONSTANTS.FACILITIES.FACILITY_RISK_PROFILE.FLAT;

const LOSS_GIVEN_DEFAULT = CONSTANTS.DEALS.LOSS_GIVEN_DEFAULT['50_PERCENT'];

const PROBABILITY_OF_DEFAULT = CONSTANTS.DEALS.PROBABILITY_OF_DEFAULT.LESS_THAN_14_PERCENT;

module.exports = {
  TASKS,
  HISTORY,
  CREDIT_RATING,
  FACILITY_RISK_PROFILE,
  LOSS_GIVEN_DEFAULT,
  PROBABILITY_OF_DEFAULT,
};
