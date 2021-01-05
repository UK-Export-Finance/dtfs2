const DEFAULTS = {
  DEALS: {
    details: {
      status: 'Draft',
    },
    eligibility: {
      status: 'Not started',
      criteria: [],
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
  },
};

module.exports = DEFAULTS;
