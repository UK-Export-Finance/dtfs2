const TEAMS = require('./teams');

/**
 * NOTE:
 * Tasks that have isConditional flag are tasks that can either be:
 * - added (depending on deal data)
 * - excluded (depending on deal data)
 * */

const GROUP_TITLES = {
  SETUP_DEAL: 'Set up deal',
  ADVERSE_HISTORY: 'Adverse history check',
  UNDERWRITING: 'Underwriting',
  APPROVALS: 'Approvals',
};

const NDB_GROUP_1_TASKS = {
  MATCH_OR_CREATE_PARTIES: 'Match or create the parties in this deal',
  CREATE_OR_LINK_SALESFORCE: 'Create or link this opportunity in Salesforce',
  FILE_ALL_DEAL_EMAILS: 'File all deal emails in this deal',
  CREATE_CREDIT_ANALYSIS_DOCUMENT: 'Create a credit submission document',
  ASSIGN_AN_UNDERWRITER: 'Assign an underwriter for this deal',
  COMPLETE_AGENT_CHECK: 'Complete an agent check',
};

const NDB_ADVERSE_HISTORY_GROUP_TASKS = {
  COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
};

const NDB_GROUP_3_TASKS = {
  CHECK_EXPOSURE: 'Check exposure',
  GIVE_EXPORTER_A_CREDIT_RATING: 'Give the exporter a credit rating',
  COMPLETE_CREDIT_ANALYSIS: 'Complete the credit submission',
};

const NDB_GROUP_4_TASKS = {
  CHECK_ADVERSE_HISTORY_CHECK: 'Check adverse history check',
  CHECK_THE_CREDIT_ANALYSIS: 'Check the credit submission',
  COMPLETE_RISK_ANALYSIS: 'Complete risk analysis (RAD)',
  APPROVE_OR_DECLINE_THE_DEAL: 'Approve or decline the deal',
  ADDENDUM_OUT: 'Addendum out',
  ADDENDUM_IN: 'Addendum in',
  EXECUTED_ADDENDUM_OUT: 'Executed Addendum out',
};

const NDB_TASKS = {
  GROUP_1: {
    id: 1,
    GROUP_TITLE: GROUP_TITLES.SETUP_DEAL,
    TASKS: [
      {
        groupId: 1,
        title: NDB_GROUP_1_TASKS.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_GROUP_1_TASKS.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        title: NDB_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_GROUP_1_TASKS.ASSIGN_AN_UNDERWRITER,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
  GROUP_2: {
    id: 2,
    GROUP_TITLE: GROUP_TITLES.ADVERSE_HISTORY,
    TASKS: [
      {
        groupId: 2,
        title: NDB_ADVERSE_HISTORY_GROUP_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: TEAMS.UNDERWRITERS,
      },
    ],
  },
  GROUP_3: {
    id: 3,
    GROUP_TITLE: GROUP_TITLES.UNDERWRITING,
    TASKS: [
      {
        groupId: 3,
        title: NDB_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: TEAMS.UNDERWRITERS,
      },
      {
        groupId: 3,
        title: NDB_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: TEAMS.UNDERWRITERS,
      },
      {
        groupId: 3,
        title: NDB_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITERS,
      },
    ],
  },
  GROUP_4: {
    id: 4,
    GROUP_TITLE: GROUP_TITLES.APPROVALS,
    TASKS: [
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.CHECK_ADVERSE_HISTORY_CHECK,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: TEAMS.RISK_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_DEAL,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.ADDENDUM_OUT,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.ADDENDUM_IN,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_GROUP_4_TASKS.EXECUTED_ADDENDUM_OUT,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
};

module.exports = {
  GROUP_TITLES,
  NDB_TASKS,
  NDB_GROUP_1_TASKS,
  NDB_ADVERSE_HISTORY_GROUP_TASKS,
  NDB_GROUP_3_TASKS,
  NDB_GROUP_4_TASKS,
};
