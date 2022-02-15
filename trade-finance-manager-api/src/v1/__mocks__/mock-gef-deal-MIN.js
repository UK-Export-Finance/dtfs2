const MOCK_GEF_DEAL = require('./mock-gef-deal');

const MOCK_GEF_DEAL_MIN = {
  ...MOCK_GEF_DEAL,
  _id: 'MOCK_GEF_DEAL_MIN',
  submissionType: 'Manual Inclusion Notice',
  manualInclusionNoticeSubmissionDate: 1234,
};

module.exports = MOCK_GEF_DEAL_MIN;
