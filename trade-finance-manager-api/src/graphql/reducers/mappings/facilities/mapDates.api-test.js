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
    issuedFacilitySubmittedToUkefTimestamp: '160690061100',
    requestedCoverStartDate: '160690061200',
    ukefGuaranteeInMonths: '12',
    ...mockCoverEndDate,
  };

  const mockFacilityTfm = {
    exposurePeriodInMonths: 3,
  };

  const mockDealDetails = {
    submissionDate: '1606900616651',
  };

  it('should return inclusionNoticeReceived as deal submissionDate', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.inclusionNoticeReceived).toEqual(mockDealDetails.submissionDate);
  });

  it('should return bankIssueNoticeReceived as facility issuedFacilitySubmittedToUkefTimestamp;', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.issuedFacilitySubmittedToUkefTimestamp);
  });

  it('should return coverStartDate as facility requestedCoverStartDate', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.coverStartDate).toEqual(mockFacility.requestedCoverStartDate);
  });

  it('should return coverEndDate as facility coverEndDate values', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.coverEndDate).toEqual(mapCoverEndDate(mockFacility));
  });

  it('should return tenor', () => {
    const result = mapDates(mockFacility, mockFacilityTfm, mockDealDetails);

    expect(result.tenor).toEqual(mapTenorDate(mockFacility, mockFacilityTfm));
  });
});
