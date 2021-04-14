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
    MATCH_OR_CREATE_PARTIES: AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
    CREATE_OR_LINK_SALESFORCE: AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
  },
};

const MIA = {
  GROUP_1: {
    GROUP_TITLE: AIN_AND_MIA.GROUP_1.GROUP_TITLE,
    MATCH_OR_CREATE_PARTIES: AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
    CREATE_OR_LINK_SALESFORCE: AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
    FILE_ALL_DEAL_EMAILS: 'File all deal emails in this deal',
    CREATE_CREDIT_ANALYSIS_DOCUMENT: 'Create a credit analysis document',
    ASSIGN_UNDERWRITER: 'Assign an underwriter for this deal',
  },
  GROUP_2: {
    GROUP_TITLE: 'Adverse history check',
    COMPLETE_ADVERSE_HISTORY_CHECK: 'Complete an adverse history check',
  },
  GROUP_3: {
    GROUP_TITLE: 'Underwriting',
    CHECK_EXPOSURE: 'Check exposure',
    GIVE_EXPORTER_CREDIT_RATING: 'Give the exporter a credit rating',
    COMPLETE_CREDIT_ANALYSIS: 'Complete a credit analysisa',
  },
  GROUP_4: {
    GROUP_TITLE: 'Approvals',
    CHECK_CREDIT_ANALYSIS: 'Check the credit analysis',
    COMPELTE_RISK_ANALYSIS: 'Complete risk analysis (RAD)',
    APPROVE_OR_DECLINE_DEAL: 'Approve or decline the deal',
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
