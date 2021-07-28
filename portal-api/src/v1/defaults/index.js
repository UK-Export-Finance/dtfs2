const DEFAULTS = {
  DEAL: {
    details: {
      status: 'Draft',
    },
    eligibility: {
      status: 'Not started',
    },
    submissionDetails: {
      status: 'Not started',
    },
    bondTransactions: {
      items: [],
    },
    loanTransactions: {
      items: [],
    },
    summary: {},
    comments: [],
    editedBy: [],
    facilities: [],
  },
};

module.exports = DEFAULTS;
