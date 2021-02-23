const mapDates = require('./mapDates');
const mapCoverEndDate = require('./mapCoverEndDate');

describe('mapDates', () => {
  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '02',
    'coverEndDate-year': '2021',
  };

  const mockFacility = {
    issuedDate: '160690061100',
    requestedCoverStartDate: '160690061200',
    ...mockCoverEndDate,
  };

  const mockDealDetails = {
    submissionDate: '1606900616651',
  };

  it('should return inclusionNoticeReceived as deal submissionDate', () => {
    const result = mapDates(mockFacility, mockDealDetails);

    expect(result.inclusionNoticeReceived).toEqual(mockDealDetails.submissionDate);
  });

  it('should return bankIssueNoticeReceived as facility issuedDate', () => {
    const result = mapDates(mockFacility, mockDealDetails);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.issuedDate);
  });

  it('should return coverStartDate as facility requestedCoverStartDate', () => {
    const result = mapDates(mockFacility, mockDealDetails);

    expect(result.coverStartDate).toEqual(mockFacility.requestedCoverStartDate);
  });

  it('should return coverEndDate as facility coverEndDate values', () => {
    const result = mapDates(mockFacility, mockDealDetails);

    expect(result.coverEndDate).toEqual(mapCoverEndDate(mockFacility));
  });
});
