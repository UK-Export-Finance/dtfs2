const TEAMS = require('./teams');

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
};

const MIA_GROUP_2_TASKS = {
  COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
};

const MIA = {
  GROUP_1: {
    GROUP_TITLE: AIN_AND_MIA.GROUP_1.GROUP_TITLE,
    TASKS: [
      {
        title: AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
        team: TEAMS.BUSINESS_SUPPORT,
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
        title: 'Check exposure',
        team: TEAMS.UNDERWRITERS,
      },
      {
        title: 'Give the exporter a credit rating',
        team: TEAMS.UNDERWRITERS,
      },
      {
        title: 'Complete the credit analysis',
        team: TEAMS.UNDERWRITERS,
      },
    ],
  },
  GROUP_4: {
    GROUP_TITLE: 'Approvals',
    TASKS: [
      {
        title: 'Check the credit analysis',
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
      {
        title: 'Complete risk analysis (RAD)',
        team: TEAMS.RISK_MANAGERS,
      },
      {
        title: 'Approve or decline the deal',
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
};

const STATUS = {
  TO_DO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Done',
};

const UNASSIGNED = 'Unassigned';

module.exports = {
  AIN_AND_MIA,
  AIN,
  MIA,
  MIA_GROUP_1_TASKS,
  MIA_GROUP_2_TASKS,
  STATUS,
  UNASSIGNED,
};
