const getSubmissionDate = require('./get-submission-date');
const MOCK_GEF_AIN_DEAL = require('../__mocks__/mock-gef-deal');
const MOCK_GEF_MIA_DEAL = require('../__mocks__/mock-gef-deal-MIA');
const MOCK_GEF_MIN_DEAL = require('../__mocks__/mock-gef-deal-MIN');

describe('Ascertain deal submission date', () => {
  it('Should return `submissionDate` as deal is an AIN', () => {
    expect(getSubmissionDate(MOCK_GEF_AIN_DEAL)).toEqual(Number(MOCK_GEF_AIN_DEAL.submissionDate));
  });

  it('Should return `submissionDate` as deal is a MIA', () => {
    expect(getSubmissionDate(MOCK_GEF_MIA_DEAL)).toEqual(Number(MOCK_GEF_MIA_DEAL.submissionDate));
  });

  it('Should return `manualInclusionNoticeSubmissionDate` as deal is a MIN', () => {
    expect(getSubmissionDate(MOCK_GEF_MIN_DEAL)).toEqual(MOCK_GEF_MIN_DEAL.manualInclusionNoticeSubmissionDate);
  });
});
