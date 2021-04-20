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
        title: 'File all deal emails in this deal',
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        title: 'Create a credit analysis document',
        team: TEAMS.BUSINESS_SUPPORT,
      },
      {
        title: 'Assign an underwriter for this deal',
        team: TEAMS.UNDERWRITER_MANAGERS,
      },
    ],
  },
  GROUP_2: {
    GROUP_TITLE: 'Adverse history check',
    TASKS: [
      {
        title: 'Complete an adverse history check',
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
        title: 'Complete a credit analysis',
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
  AIN,
  MIA,
  STATUS,
  UNASSIGNED,
};
