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

    const mockCurrency = {
      text: 'GBP - UK Sterling',
      id: 'GBP',
    };

    const mockFacilities = [
      {
        facilityType: 'bond',
        test: true,
        ...mockCoverEndDate,
        ukefExposure: mockUkefExposure,
        coveredPercentage: mockCoveredPercentage,
        bondType: 'Performance Bond',
        currency: mockCurrency,
      },
      {
        facilityType: 'loan',
        test: true,
        ...mockCoverEndDate,
        ukefExposure: mockUkefExposure,
        coveredPercentage: mockCoveredPercentage,
        currency: mockCurrency,
      },
    ];

    const result = mapFacilities(mockFacilities);

    const coverEndDate = moment().set({
      date: Number(mockCoverEndDate['coverEndDate-day']),
      month: Number(mockCoverEndDate['coverEndDate-month']) - 1, // months are zero indexed
      year: Number(mockCoverEndDate['coverEndDate-year']),
    });

    const expectedCoverEndDate = moment(coverEndDate).format('DD MMM YYYY');

    const expectedUkefExposure = `${mockCurrency.id} ${mockUkefExposure}`;
    const expectedCoveredPercentage = `${mockCoveredPercentage}%`;

    const expected = [
      {
        ...mockFacilities[0],
        facilityProduct: 'BSS',
        facilityType: 'Performance Bond',
        coverEndDate: expectedCoverEndDate,
        ukefExposure: expectedUkefExposure,
        coveredPercentage: expectedCoveredPercentage,
      },
      {
        ...mockFacilities[1],
        facilityType: null,
        facilityProduct: 'EWCS',
        coverEndDate: expectedCoverEndDate,
        ukefExposure: expectedUkefExposure,
        coveredPercentage: expectedCoveredPercentage,
      },
    ];

    expect(result).toEqual(expected);
  });
});
