const TEAMS = require('./teams');

/**
 * NOTE:
 * Tasks that have isConditional flag are tasks that can either be:
 * - added (depending on amendment data)
 * - excluded (depending on amendment data)
 * */

const GROUP_TITLES = {
  SETUP_AMENDMENT: 'Set up amendment',
  ADVERSE_HISTORY: 'Adverse history check',
  UNDERWRITING: 'Underwrite amendment',
  APPROVALS: 'Amendment approvals',
};

const MANUAL_AMENDMENT_GROUP_1_TASKS = {
  FILE_ALL_AMENDMENT_EMAILS: 'File all emails about this amendment request',
  CREATE_CREDIT_ANALYSIS_DOCUMENT: 'Create a credit submission document',
  ASSIGN_AN_UNDERWRITER: 'Assign an underwriter for this amendment request',
};

const MANUAL_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS = {
  COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
};

const MANUAL_AMENDMENT_GROUP_3_TASKS = {
  CHECK_EXPOSURE: 'Check exposure',
  COMPLETE_CREDIT_ANALYSIS: 'Complete the credit submission',
};

const MANUAL_AMENDMENT_GROUP_4_TASKS = {
  CHECK_ADVERSE_HISTORY_CHECK: 'Check adverse history check',
  CHECK_THE_CREDIT_ANALYSIS: 'Check the credit submission',
  COMPLETE_RISK_ANALYSIS: 'Complete risk analysis (RAD)',
  APPROVE_OR_DECLINE_THE_DEAL: 'Approve or decline the amendment',
  RECORD_BANKS_DECISION: 'Record the bank\'s decision',
};

const AUTOMATIC_AMENDMENT = {
  GROUP_1: {
    GROUP_TITLE: GROUP_TITLES.SETUP_AMENDMENT,
    TASKS: [
      {
        title: MANUAL_AMENDMENT_GROUP_1_TASKS.FILE_ALL_AMENDMENT_EMAILS,
        team: TEAMS.PIM,
        isConditional: true,
      },
    ],
  },
};

const MANUAL_AMENDMENT = {
  GROUP_1: {
    id: 1,
    GROUP_TITLE: GROUP_TITLES.SETUP_AMENDMENT,
    TASKS: [
      {
        groupId: 1,
        title: MANUAL_AMENDMENT_GROUP_1_TASKS.FILE_ALL_AMENDMENT_EMAILS,
        team: TEAMS.PIM,
      },
      {
        groupId: 1,
        title: MANUAL_AMENDMENT_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        groupId: 1,
        title: MANUAL_AMENDMENT_GROUP_1_TASKS.ASSIGN_AN_UNDERWRITER,
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
        title: MANUAL_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
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
        title: MANUAL_AMENDMENT_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: TEAMS.UNDERWRITERS,
      },
      {
        groupId: 3,
        title: MANUAL_AMENDMENT_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
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
        title: MANUAL_AMENDMENT_GROUP_4_TASKS.CHECK_ADVERSE_HISTORY_CHECK,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: MANUAL_AMENDMENT_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: MANUAL_AMENDMENT_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: TEAMS.RISK_MANAGERS,
      },
      {
        groupId: 4,
        title: MANUAL_AMENDMENT_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_DEAL,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        groupId: 4,
        title: MANUAL_AMENDMENT_GROUP_4_TASKS.RECORD_BANKS_DECISION,
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
  AUTOMATIC_AMENDMENT,
  MANUAL_AMENDMENT,
  MANUAL_AMENDMENT_GROUP_1_TASKS,
  MANUAL_AMENDMENT_ADVERSE_HISTORY_GROUP_TASKS,
  MANUAL_AMENDMENT_GROUP_3_TASKS,
  MANUAL_AMENDMENT_GROUP_4_TASKS,
  STATUS,
  UNASSIGNED,
};
