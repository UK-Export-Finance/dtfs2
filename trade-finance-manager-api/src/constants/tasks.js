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

const MIA_GROUP_2_TASKS = {
  COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
};

const MIA_GROUP_3_TASKS = {
  CHECK_EXPOSURE: 'Check exposure',
  GIVE_EXPORTER_A_CREDIT_RATING: 'Give the exporter a credit rating',
  COMPLETE_CREDIT_ANALYSIS: 'Complete the credit analysis',
  
};

const MIA_GROUP_4_TASKS = {
  CHECK_THE_CREDIT_ANALYSIS: 'Check the credit analysis',
  COMPLETE_RISK_ANALYSIS: 'Complete risk analysis (RAD)',
  APPROVE_OR_DECLINE_THE_DEAL: 'Approve or decline the deal',
};

const MIA = {
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
      {
        title: MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        title: MIA_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
        team: TEAMS.UNDERWRITING_SUPPORT,
      },
      {
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
    GROUP_TITLE: 'Adverse history check',
    TASKS: [
      {
        title: MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
  GROUP_3: {
    GROUP_TITLE: 'Underwriting',
    TASKS: [
      {
        title: MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
        team: TEAMS.UNDERWRITERS,
      },
      {
        title: MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
        team: TEAMS.UNDERWRITERS,
      },
      {
        title: MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITERS,
      },
    ],
  },
  GROUP_4: {
    GROUP_TITLE: 'Approvals',
    TASKS: [
      {
        title: MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        title: MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
        team: TEAMS.RISK_MANAGERS,
      },
      {
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
  AIN,
  MIA,
  MIA_GROUP_1_TASKS,
  MIA_GROUP_2_TASKS,
  MIA_GROUP_3_TASKS,
  MIA_GROUP_4_TASKS,
  STATUS,
  UNASSIGNED,
};
