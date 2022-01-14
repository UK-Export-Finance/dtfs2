const moment = require('moment');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenorDate = require('../facilities/mapTenorDate');
const { convertDateToTimestamp } = require('../../../../utils/date');

const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../../../v1/__mocks__/mock-cash-contingent-facilities');

describe('mapGefFacilityDates', () => {
  const mockFacility = {
    ...MOCK_CASH_CONTINGENT_FACILIIES[0],
    facilityStage: 'Issued',
    hasBeenIssued: true,
  };

  const mockFacilityTfm = {
    exposurePeriodInMonths: 12,
  };

  it('should return inclusionNoticeReceived as deal submissionDate if manualInclusionNoticeSubmissionDate is empty', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    expect(result.inclusionNoticeReceived).toEqual(MOCK_GEF_DEAL.submissionDate);
  });

  it('should return manualInclusionNoticeSubmissionDate as deal submissionDate if manualInclusionNoticeSubmissionDate has a value', () => {
    const mockMinDeal = {
      ...MOCK_GEF_DEAL,
      manualInclusionNoticeSubmissionDate: '16069006199999',
    };

    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, mockMinDeal);

    expect(result.inclusionNoticeReceived).toEqual(mockMinDeal.manualInclusionNoticeSubmissionDate);
  });

  it('should return bankIssueNoticeReceived as submittedAsIssuedDate', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.submittedAsIssuedDate);
  });

  it('should return coverStartDate as timestamp', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = convertDateToTimestamp(mockFacility.coverStartDate);

    expect(result.coverStartDate).toEqual(expected);
  });

  it('should return mapped coverEndDate', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = mapCoverEndDate(
      moment(mockFacility.coverEndDate).format('DD'),
      moment(mockFacility.coverEndDate).format('MM'),
      moment(mockFacility.coverEndDate).format('YYYY'),
    );

    expect(result.coverEndDate).toEqual(expected);
  });

  it('should return mapped tenor', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = mapTenorDate(
      mockFacility.facilityStage,
      mockFacility.monthsOfCover,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.tenor).toEqual(expected);
  });
});
