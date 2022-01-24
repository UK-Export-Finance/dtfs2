const mapDates = require('./mapDates');
const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenorDate = require('./mapTenorDate');

describe('mapDates', () => {
  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '02',
    'coverEndDate-year': '2021',
  };

  const mockFacility = {
    submittedAsIssuedDate: 160690061100,
    requestedCoverStartDate: '2021-12-08T00:00:00.000Z',
    ukefGuaranteeInMonths: '12',
    ...mockCoverEndDate,
  };

  const mockFacilityTfm = {
    exposurePeriodInMonths: 3,
  };

  const mockDealDetails = {
    submissionDate: '1606900616651',
  };

  it('should return inclusionNoticeReceived as deal submissionDate if manualInclusionNoticeSubmissionDate is empty', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);
    expect(result.inclusionNoticeReceived).toEqual(mockDealDetails.submissionDate);
  });

  it('should return manualInclusionNoticeSubmissionDate as deal submissionDate if manualInclusionNoticeSubmissionDate has a value', () => {
    const minMockDealDetails = {
      ...mockDealDetails,
      manualInclusionNoticeSubmissionDate: '16069006199999',
    };
    const result = mapDates(mockFacility, mockFacilityTfm, minMockDealDetails);
    expect(result.inclusionNoticeReceived).toEqual(minMockDealDetails.manualInclusionNoticeSubmissionDate);
  });

  it('should return bankIssueNoticeReceived as facility submittedAsIssuedDate;', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.submittedAsIssuedDate);
  });

  it('should return coverStartDate as facility requestedCoverStartDate', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.coverStartDate).toEqual(mockFacility.requestedCoverStartDate);
  });

  it('should return coverEndDate as facility coverEndDate values', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    const expected = mapCoverEndDate(
      mockCoverEndDate['coverEndDate-day'],
      mockCoverEndDate['coverEndDate-month'],
      mockCoverEndDate['coverEndDate-year'],
    );

    expect(result.coverEndDate).toEqual(expected);
  });

  it('should return tenor', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    const expected = mapTenorDate(
      mockFacility.facilityStage,
      mockFacility.ukefGuaranteeInMonths,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.tenor).toEqual(expected);
  });
});
