const moment = require('moment');
const mapFacilities = require('./mapFacilities');

describe('mapFacilities', () => {
  it('should map and format correct fields/values', async () => {
    const mockCoverEndDate = {
      'coverEndDate-day': '01',
      'coverEndDate-month': '02',
      'coverEndDate-year': '2021',
    };

    const mockUkefExposure = '1,234.00';
    const mockCoveredPercentage = '10';

    const mockFacilities = [
      {
        facilityType: 'bond',
        test: true,
        ...mockCoverEndDate,
        ukefExposure: mockUkefExposure,
        coveredPercentage: mockCoveredPercentage,
      },
      {
        facilityType: 'loan',
        test: true,
        ...mockCoverEndDate,
        ukefExposure: mockUkefExposure,
        coveredPercentage: mockCoveredPercentage,
      },
    ];

    const result = mapFacilities(mockFacilities);

    const coverEndDate = moment().set({
      date: Number(mockCoverEndDate['coverEndDate-day']),
      month: Number(mockCoverEndDate['coverEndDate-month']) - 1, // months are zero indexed
      year: Number(mockCoverEndDate['coverEndDate-year']),
    });

    const expectedCoverEndDate = moment(coverEndDate).format('DD MMM YYYY');

    const expectedUkefExposure = `GBP ${mockUkefExposure} (${mockCoveredPercentage}%)`;

    const expected = [
      {
        ...mockFacilities[0],
        facilityProduct: 'BSS',
        coverEndDate: expectedCoverEndDate,
        ukefExposure: expectedUkefExposure,
      },
      {
        ...mockFacilities[1],
        facilityProduct: 'EWCS',
        coverEndDate: expectedCoverEndDate,
        ukefExposure: expectedUkefExposure,
      },
    ];

    expect(result).toEqual(expected);
  });
});
