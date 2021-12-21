const DEFAULTS = {
  DEAL: {
    status: 'Draft',
    details: {},
    eligibility: {
      status: 'Not started',
      criteria: [],
    },
    submissionDetails: {
      status: 'Not started',
    },
    summary: {},
    comments: [],
    editedBy: [],
    facilities: [],
    exporter: {},
  },
  DEAL_TFM: {
    history: {
      tasks: [],
      emails: [],
    },
  },
  FACILITY_TFM: {},
};

module.exports = DEFAULTS;
