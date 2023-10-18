const { format, fromUnixTime } = require('date-fns');
const mapDates = require('./mapDates');
const mapCoverEndDate = require('./mapCoverEndDate');
const mapTenorDate = require('./mapTenorDate');
const { FACILITIES } = require('../../../../constants');

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
    facilitySnapshot: {
      submittedAsIssuedDate: 160690061100,
      requestedCoverStartDate: '2021-12-08T00:00:00.000Z',
      ukefFacilityType: FACILITIES.FACILITY_TYPE.BOND,
      ukefGuaranteeInMonths: '12',
      ...mockCoverEndDate,
      ...mockCoverStartDate,
    },
  };

  const mockFacilityTfm = {
    exposurePeriodInMonths: 3,
  };

  const mockDealDetails = {
    submissionDate: '1606900616651',
  };

  it('should return inclusionNoticeReceived as deal submissionDate if manualInclusionNoticeSubmissionDate is empty', () => {
    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);
    expect(result.inclusionNoticeReceived).toEqual(mockDealDetails.submissionDate);
  });

  it('should return manualInclusionNoticeSubmissionDate as deal submissionDate if manualInclusionNoticeSubmissionDate has a value', () => {
    const minMockDealDetails = {
      ...mockDealDetails,
      manualInclusionNoticeSubmissionDate: '16069006199999',
    };
    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, minMockDealDetails);
    expect(result.inclusionNoticeReceived).toEqual(minMockDealDetails.manualInclusionNoticeSubmissionDate);
  });

  it('should return bankIssueNoticeReceived as facility submittedAsIssuedDate;', () => {
    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.facilitySnapshot.submittedAsIssuedDate);
  });

  it('should return coverStartDate as facility requestedCoverStartDate', () => {
    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    expect(result.coverStartDate).toEqual(mockFacility.facilitySnapshot.requestedCoverStartDate);
  });

  it('should return coverEndDate as facility coverEndDate values', () => {
    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    const expected = mapCoverEndDate(
      mockCoverEndDate['coverEndDate-day'],
      mockCoverEndDate['coverEndDate-month'],
      mockCoverEndDate['coverEndDate-year'],
      mockFacility,
    );

    expect(result.coverEndDate).toEqual(expected);
  });

  it('should return tenor', () => {
    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    const expected = mapTenorDate(
      mockFacility.facilitySnapshot.facilityStage,
      mockFacility.facilitySnapshot.ukefGuaranteeInMonths,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.tenor).toEqual(expected);
  });

  it('should not return amendment tenor and coverEndDate if amendment not completed', () => {
    const coverEndDateUnix = 1658403289;

    mockFacility.amendments = [
      {
        coverEndDate: coverEndDateUnix,
      },
    ];

    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    const expectedCoverEndDate = mapCoverEndDate(
      mockCoverEndDate['coverEndDate-day'],
      mockCoverEndDate['coverEndDate-month'],
      mockCoverEndDate['coverEndDate-year'],
      mockFacility,
    );

    const expectedTenor = mapTenorDate(
      mockFacility.facilitySnapshot.facilityStage,
      mockFacility.facilitySnapshot.ukefGuaranteeInMonths,
      mockFacilityTfm.exposurePeriodInMonths,
    );

    expect(result.coverEndDate).toEqual(expectedCoverEndDate);
    expect(result.tenor).toEqual(expectedTenor);
  });

  it('should return amendment tenor and coverEndDate if amendment completed', () => {
    const coverEndDateUnix = 1658403289;
    const amendmentTenorPeriod = 2;

    mockFacility.amendments = [
      {
        tfm: {
          coverEndDate: coverEndDateUnix,
          amendmentExposurePeriodInMonths: amendmentTenorPeriod,
        },
      },
    ];

    const result = mapDates(mockFacility, mockFacility.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    const expectedCoverEndDate = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');

    const expectedTenor = mapTenorDate(
      mockFacility.facilitySnapshot.facilityStage,
      mockFacility.facilitySnapshot.ukefGuaranteeInMonths,
      amendmentTenorPeriod,
    );

    expect(result.coverEndDate).toEqual(expectedCoverEndDate);
    expect(result.tenor).toEqual(expectedTenor);
  });
});
