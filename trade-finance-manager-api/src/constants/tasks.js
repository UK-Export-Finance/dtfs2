const TEAMS = require('./teams');

/**
 * NOTE:
 * Tasks that have isConditional flag are tasks that can either be:
 * - added (depending on deal data)
 * - excluded (depending on deal data)
 * */

const AIN_AND_MIA = {
  GROUP_1: {
    GROUP_TITLE: 'Set up deal',
    MATCH_OR_CREATE_PARTIES: 'Match or create the parties in this deal',
    CREATE_OR_LINK_SALESFORCE: 'Create or link this opportunity in Salesforce',
  },
};

const AIN_AND_MIA_ID = {
  GROUP_1: {
    CREATE_OR_LINK_SALESFORCE: '1',
  },
};

const AIN = {
  GROUP_1: {
    GROUP_TITLE: AIN_AND_MIA.GROUP_1.GROUP_TITLE,
    TASKS: [
      {
        title: AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: TEAMS.BUSINESS_SUPPORT,
        isConditional: true,
      },
      {
        title: AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: TEAMS.BUSINESS_SUPPORT,
      },
    ],
  },
};

const MIA_GROUP_1_TASKS = {
  FILE_ALL_DEAL_EMAILS: 'File all deal emails in this deal',
  CREATE_CREDIT_ANALYSIS_DOCUMENT: 'Create a credit analysis document',
  ASSIGN_AN_UNDERWRITER: 'Assign an underwriter for this deal',
  COMPLETE_AGENT_CHECK: 'Complete an agent check',
};

const MIA_GROUP_1_TASKS_ID = {
  GROUPID: 1,
  FILE_ALL_DEAL_EMAILS: '2',
  CREATE_CREDIT_ANALYSIS_DOCUMENT: '3',
  ASSIGN_AN_UNDERWRITER: '4',
};

const MIA_GROUP_2_TASKS = {
  COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
};

const MIA_GROUP_2_TASKS_ID = {
  GROUPID: 2,
  COMPLETE_ADVERSE_HISTORY_CHECK: '1',
};

const MIA_GROUP_3_TASKS = {
  CHECK_EXPOSURE: 'Check exposure',
  GIVE_EXPORTER_A_CREDIT_RATING: 'Give the exporter a credit rating',
  COMPLETE_CREDIT_ANALYSIS: 'Complete the credit analysis',
};

const MIA_GROUP_3_TASKS_ID = {
  GROUPID: 3,
  CHECK_EXPOSURE: '1',
  GIVE_EXPORTER_A_CREDIT_RATING: '2',
  COMPLETE_CREDIT_ANALYSIS: '3',
};

const MIA_GROUP_4_TASKS = {
  CHECK_THE_CREDIT_ANALYSIS: 'Check the credit analysis',
  COMPLETE_RISK_ANALYSIS: 'Complete risk analysis (RAD)',
  APPROVE_OR_DECLINE_THE_DEAL: 'Approve or decline the deal',
};

const MIA_GROUP_4_TASKS_ID = {
  GROUPID: 4,
  CHECK_THE_CREDIT_ANALYSIS: '1',
  COMPLETE_RISK_ANALYSIS: '2',
  APPROVE_OR_DECLINE_THE_DEAL: '3',
};

const MIA = {
  GROUP_1: {
    id: 1,
    GROUP_TITLE: AIN_AND_MIA.GROUP_1.GROUP_TITLE,
    TASKS: [
      {
        title: AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: TEAMS.BUSINESS_SUPPORT,
        isConditional: true,
      },
      {
        id: AIN_AND_MIA_ID.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        groupId: MIA_GROUP_1_TASKS_ID.GROUPID,
        title: AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        id: MIA_GROUP_1_TASKS_ID.FILE_ALL_DEAL_EMAILS,
        groupId: MIA_GROUP_1_TASKS_ID.GROUPID,
        title: MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        id: MIA_GROUP_1_TASKS_ID.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        groupId: MIA_GROUP_1_TASKS_ID.GROUPID,
        title: MIA_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
        id: MIA_GROUP_1_TASKS_ID.ASSIGN_AN_UNDERWRITER,
        groupId: MIA_GROUP_1_TASKS_ID.GROUPID,
        title: MIA_GROUP_1_TASKS.ASSIGN_AN_UNDERWRITER,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        title: MIA_GROUP_1_TASKS.COMPLETE_AGENT_CHECK,
        team: TEAMS.UNDERWRITERS,
        isConditional: true,
      },
    ],
  },
  GROUP_2: {
    id: 2,
    GROUP_TITLE: 'Adverse history check',
    TASKS: [
      {
        id: MIA_GROUP_2_TASKS_ID.COMPLETE_ADVERSE_HISTORY_CHECK,
        groupId: MIA_GROUP_2_TASKS_ID.GROUPID,
        title: MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
  GROUP_3: {
    id: 3,
    GROUP_TITLE: 'Underwriting',
    TASKS: [
      {
        id: MIA_GROUP_3_TASKS_ID.CHECK_EXPOSURE,
        groupId: MIA_GROUP_3_TASKS_ID.GROUPID,
        title: MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: TEAMS.UNDERWRITERS,
      },
      {
        id: MIA_GROUP_3_TASKS_ID.GIVE_EXPORTER_A_CREDIT_RATING,
        groupId: MIA_GROUP_3_TASKS_ID.GROUPID,
        title: MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: TEAMS.UNDERWRITERS,
      },
      {
        id: MIA_GROUP_3_TASKS_ID.COMPLETE_CREDIT_ANALYSIS,
        groupId: MIA_GROUP_3_TASKS_ID.GROUPID,
        title: MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITERS,
      },
    ],
  },
  GROUP_4: {
    id: 4,
    GROUP_TITLE: 'Approvals',
    TASKS: [
      {
        id: MIA_GROUP_4_TASKS_ID.CHECK_THE_CREDIT_ANALYSIS,
        groupId: MIA_GROUP_4_TASKS_ID.GROUPID,
        title: MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        id: MIA_GROUP_4_TASKS_ID.COMPLETE_RISK_ANALYSIS,
        groupId: MIA_GROUP_4_TASKS_ID.GROUPID,
        title: MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: TEAMS.RISK_MANAGERS,
      },
      {
        id: MIA_GROUP_4_TASKS_ID.APPROVE_OR_DECLINE_THE_DEAL,
        groupId: MIA_GROUP_4_TASKS_ID.GROUPID,
        title: MIA_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_DEAL,
        team: TEAMS.UNDERWRITER_MANAGERS,
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
  AIN_AND_MIA,
  AIN_AND_MIA_ID,
  AIN,
  MIA,
  MIA_GROUP_1_TASKS,
  MIA_GROUP_1_TASKS_ID,
  MIA_GROUP_2_TASKS,
  MIA_GROUP_2_TASKS_ID,
  MIA_GROUP_3_TASKS,
  MIA_GROUP_3_TASKS_ID,
  MIA_GROUP_4_TASKS,
  MIA_GROUP_4_TASKS_ID,
  STATUS,
  UNASSIGNED,
};
