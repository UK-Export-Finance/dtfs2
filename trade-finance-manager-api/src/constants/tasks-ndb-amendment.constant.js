const TEAMS = require('./teams');

/**
 * NOTE:
 * Tasks that have isConditional flag are tasks that can either be:
 * - added (depending on amendment data)
 * - excluded (depending on amendment data)
 * */

const GROUP_TITLES = {
  SETUP_AMENDMENT: 'Set up Deal',
  ADVERSE_HISTORY: 'Adverse history check',
  UNDERWRITING: 'Underwriting',
  APPROVALS: 'Approvals',
};

const NDB_AMENDMENT_GROUP_1_TASKS = {
  MATCH_OR_CREATE_PARTIES: 'Match or create parties in this deal',
  CREATE_OR_LINK_SALESFORCE: 'Create or link this opportunity in Salesforce',
  FILE_ALL_DEAL_EMAILS: 'File all deal emails in this deal',
  CREATE_CREDIT_ANALYSIS_DOCUMENT: 'Create a credit analysis document',
  COMPLETE_AGENT_CHECK: 'Complete an agent check',
  ASSIGN_AN_UNDERWRITER: 'Assign an underwriter for this deal',
};

const NDB_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS = {
  COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
};

const NDB_AMENDMENT_GROUP_3_TASKS = {
  CHECK_EXPOSURE: 'Check exposure',
  GIVE_CREDIT_RATING: 'Give the exporter a credit rating (RAD)',
  COMPLETE_CREDIT_ANALYSIS: 'Complete the credit submission',
};

const NDB_AMENDMENT_GROUP_4_TASKS = {
  CHECK_ADVERSE_HISTORY_CHECK: 'Check adverse history check',
  CHECK_THE_CREDIT_ANALYSIS: 'Check the credit submission',
  COMPLETE_RISK_ANALYSIS: 'Complete risk analysis (RAD)',
  APPROVE_OR_DECLINE_THE_AMENDMENT: 'Approve or decline the amendment',
  CREATE_SIDE_LETTER: 'Create side letter and send to the bank',
  COUNTERSIGNED_LETTER_RECEIVED: 'Countersigned side letter received from the bank',
  CREATE_SHAREPOINT_TASK: 'Create SharePoint task to update ACBS ',
};

const NDB_AMENDMENT = {
  GROUP_1: {
    id: 1,
    GROUP_TITLE: GROUP_TITLES.SETUP_AMENDMENT,
    TASKS: [
      {
        groupId: 1,
        title: NDB_AMENDMENT_GROUP_1_TASKS.MATCH_OR_CREATE_PARTIES,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_AMENDMENT_GROUP_1_TASKS.CREATE_OR_LINK_SALESFORCE,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_AMENDMENT_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        groupId: 1,
        title: NDB_AMENDMENT_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        title: NDB_AMENDMENT_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
        team: TEAMS.UNDERWRITERS,
      },
      {
        groupId: 1,
        title: NDB_AMENDMENT_GROUP_1_TASKS.ASSIGN_AN_UNDERWRITER,
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
        title: NDB_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
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
        title: NDB_AMENDMENT_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: TEAMS.UNDERWRITERS,
      },
      {
        groupId: 3,
        title: NDB_AMENDMENT_GROUP_3_TASKS.GIVE_CREDIT_RATING,
        team: TEAMS.RISK_MANAGERS,
      },
      {
        groupId: 3,
        title: NDB_AMENDMENT_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
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
        title: NDB_AMENDMENT_GROUP_4_TASKS.CHECK_ADVERSE_HISTORY_CHECK,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_AMENDMENT_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_AMENDMENT_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: TEAMS.RISK_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_AMENDMENT_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_AMENDMENT,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: NDB_AMENDMENT_GROUP_4_TASKS.CREATE_SIDE_LETTER,
        team: TEAMS.PIM,
      },
      {
        groupId: 4,
        title: NDB_AMENDMENT_GROUP_4_TASKS.COUNTERSIGNED_LETTER_RECEIVED,
        team: TEAMS.PIM,
      },
      {
        groupId: 4,
        title: NDB_AMENDMENT_GROUP_4_TASKS.CREATE_SHAREPOINT_TASK,
        team: TEAMS.PIM,
      },
    ],
  },
};

const STATUS = {
  TO_DO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Done',
  CANNOT_START: 'Cannot start yet',
};

const UNASSIGNED = 'Unassigned';

module.exports = {
  GROUP_TITLES,
  NDB_AMENDMENT,
  NDB_AMENDMENT_GROUP_1_TASKS,
  NDB_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS,
  NDB_AMENDMENT_GROUP_3_TASKS,
  NDB_AMENDMENT_GROUP_4_TASKS,
  STATUS,
  UNASSIGNED,
};
