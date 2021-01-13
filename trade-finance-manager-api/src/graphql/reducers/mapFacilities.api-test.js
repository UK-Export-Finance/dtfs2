const moment = require('moment');
const mapFacilities = require('./mapFacilities');

describe('mapFacilities', () => {
  it('should map `bond` and `loan` facilityType with FACILITY_TYPE_CODE and return a formatted expectedExpiryDate', async () => {
    const mockCoverEndDate = {
      'coverEndDate-day': '01',
      'coverEndDate-month': '02',
      'coverEndDate-year': '2021',
    };

    const mockFacilities = [
      {
        facilityType: 'bond',
        test: true,
        ...mockCoverEndDate,
      },
      {
        facilityType: 'loan',
        test: true,
        ...mockCoverEndDate,
      },
    ];

    const result = mapFacilities(mockFacilities);

    const coverEndDate = moment().set({
      date: Number(mockCoverEndDate['coverEndDate-day']),
      month: Number(mockCoverEndDate['coverEndDate-month']) - 1, // months are zero indexed
      year: Number(mockCoverEndDate['coverEndDate-year']),
    });

    const expectedExpiryDate = moment(coverEndDate).format('DD MMM YYYY');

    const expected = [
      {
        ...mockFacilities[0],
        facilityType: 'BSS',
        expectedExpiryDate,
      },
      {
        ...mockFacilities[1],
        facilityType: 'EWCS',
        expectedExpiryDate,
      },
    ];

    expect(result).toEqual(expected);
  });
});
