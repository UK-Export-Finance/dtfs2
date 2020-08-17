const DEFAULTS = {
  DEALS: {
    details: {
      status: 'Draft',
    },
    eligibility: {
      status: 'Incomplete',
    },
    submissionDetails: {
      status: 'Not Started',
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
