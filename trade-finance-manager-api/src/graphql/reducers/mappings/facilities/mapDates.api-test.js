const { format, fromUnixTime } = require('date-fns');
const mapDates = require('./mapDates');
const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenorDate = require('./mapTenorDate');
const api = require('../../../../v1/api');
const { DEALS, FACILITIES } = require('../../../../constants');
const { calculateAmendmentTenor } = require('../../../helpers/amendment.helpers');

describe('mapDates', () => {
  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '06',
    'coverEndDate-year': '2022',
  };

  const mockCoverStartDate = {
    'requestedCoverStartDate-year': '2022',
    'requestedCoverStartDate-month': '5',
    'requestedCoverStartDate-day': '1',
  };

  const mockFacility = {
    _id: '1',
    submittedAsIssuedDate: 160690061100,
    requestedCoverStartDate: '2021-12-08T00:00:00.000Z',
    ukefFacilityType: FACILITIES.FACILITY_TYPE.BOND,
    ukefGuaranteeInMonths: '12',
    ...mockCoverEndDate,
    ...mockCoverStartDate,
  };

  const mockFacilityTfm = {
    exposurePeriodInMonths: 3,
  };

  const mockDealDetails = {
    submissionDate: '1606900616651',
  };

  beforeEach(() => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});
  });

  it('should return inclusionNoticeReceived as deal submissionDate if manualInclusionNoticeSubmissionDate is empty', async () => {
    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);
    expect(result.inclusionNoticeReceived).toEqual(mockDealDetails.submissionDate);
  });

  it('should return manualInclusionNoticeSubmissionDate as deal submissionDate if manualInclusionNoticeSubmissionDate has a value', async () => {
    const minMockDealDetails = {
      ...mockDealDetails,
      manualInclusionNoticeSubmissionDate: '16069006199999',
    };
    const result = await mapDates(mockFacility, mockFacilityTfm, minMockDealDetails);
    expect(result.inclusionNoticeReceived).toEqual(minMockDealDetails.manualInclusionNoticeSubmissionDate);
  });

  it('should return bankIssueNoticeReceived as facility submittedAsIssuedDate;', async () => {
    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.submittedAsIssuedDate);
  });

  it('should return coverStartDate as facility requestedCoverStartDate', async () => {
    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.coverStartDate).toEqual(mockFacility.requestedCoverStartDate);
  });

  it('should return coverEndDate as facility coverEndDate values', async () => {
    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    const expected = await mapCoverEndDate(
      mockCoverEndDate['coverEndDate-day'],
      mockCoverEndDate['coverEndDate-month'],
      mockCoverEndDate['coverEndDate-year'],
      mockFacility,
    );

    expect(result.coverEndDate).toEqual(expected);
  });

  it('should return tenor', async () => {
    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    const expected = mapTenorDate(
      mockFacility.facilityStage,
      mockFacility.ukefGuaranteeInMonths,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.tenor).toEqual(expected);
  });

  it('should not return amendment tenor and coverEndDate if amendment not completed', async () => {
    const coverEndDateUnix = 1658403289;

    api.getLatestCompletedAmendment = () => Promise.resolve({
      coverEndDate: coverEndDateUnix,
      amendmentId: '1234',
      requireUkefApproval: true,
      ukefDecision: {
        submitted: true,
        coverEndDate: DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      },
    });

    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    const expectedCoverEndDate = await mapCoverEndDate(
      mockCoverEndDate['coverEndDate-day'],
      mockCoverEndDate['coverEndDate-month'],
      mockCoverEndDate['coverEndDate-year'],
      mockFacility,
    );

    const expectedTenor = mapTenorDate(
      mockFacility.facilityStage,
      mockFacility.ukefGuaranteeInMonths,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.coverEndDate).toEqual(expectedCoverEndDate);
    expect(result.tenor).toEqual(expectedTenor);
  });

  it('should return amendment tenor and coverEndDate if amendment completed', async () => {
    const coverEndDateUnix = 1658403289;
    const mockAmendment = {
      coverEndDate: coverEndDateUnix,
      requireUkefApproval: true,
      amendmentId: '1234',
      ukefDecision: {
        submitted: true,
        coverEndDate: DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
      },
      bankDecision: {
        submitted: true,
        decision: DEALS.AMENDMENT_BANK_DECISION.PROCEED,
      },
    };

    api.getLatestCompletedAmendment = () => Promise.resolve(mockAmendment);

    const result = await mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    const expectedCoverEndDate = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');

    const tenorPeriod = await calculateAmendmentTenor(mockFacility, mockAmendment);

    const expectedTenor = mapTenorDate(
      mockFacility.facilityStage,
      mockFacility.ukefGuaranteeInMonths,
      tenorPeriod,
    );

    expect(result.coverEndDate).toEqual(expectedCoverEndDate);
    expect(result.tenor).toEqual(expectedTenor);
  });
});
