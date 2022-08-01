const moment = require('moment');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenorDate = require('../facilities/mapTenorDate');
const { convertDateToTimestamp } = require('../../../../utils/date');
const api = require('../../../../v1/api');

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

  beforeEach(() => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});
  });

  it('should return inclusionNoticeReceived as deal submissionDate if manualInclusionNoticeSubmissionDate is empty', async () => {
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    expect(result.inclusionNoticeReceived).toEqual(MOCK_GEF_DEAL.submissionDate);
  });

  it('should return manualInclusionNoticeSubmissionDate as deal submissionDate if manualInclusionNoticeSubmissionDate has a value', async () => {
    const mockMinDeal = {
      ...MOCK_GEF_DEAL,
      manualInclusionNoticeSubmissionDate: '16069006199999',
    };

    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, mockMinDeal);

    expect(result.inclusionNoticeReceived).toEqual(mockMinDeal.manualInclusionNoticeSubmissionDate);
  });

  it('should return bankIssueNoticeReceived as submittedAsIssuedDate', async () => {
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.submittedAsIssuedDate);
  });

  it('should return coverStartDate as timestamp', async () => {
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = convertDateToTimestamp(mockFacility.coverStartDate);

    expect(result.coverStartDate).toEqual(expected);
  });

  it('should return mapped coverEndDate', async () => {
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = await mapCoverEndDate(
      moment(mockFacility.coverEndDate).format('DD'),
      moment(mockFacility.coverEndDate).format('MM'),
      moment(mockFacility.coverEndDate).format('YYYY'),
      mockFacility,
    );

    expect(result.coverEndDate).toEqual(expected);
  });

  it('should return mapped tenor', async () => {
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = mapTenorDate(
      mockFacility.facilityStage,
      mockFacility.monthsOfCover,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.tenor).toEqual(expected);
  });

  it('should not map coverStartDate when date is null', async () => {
    mockFacility.coverStartDate = null;
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    // undefined as not set in function
    expect(result.coverStartDate).toBeUndefined();
  });

  it('should not map coverEndDate when date is null', async () => {
    mockFacility.coverEndDate = null;
    const result = await mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    // undefined as not set in function
    expect(result.coverEndDate).toBeUndefined();
  });
});
