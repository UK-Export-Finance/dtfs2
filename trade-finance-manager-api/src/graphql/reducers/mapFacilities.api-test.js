const moment = require('moment');
const mapFacilities = require('./mapFacilities');

describe('mapFacilities', () => {
  it('should map `bond` and `loan` facilityType/facilityProduct with FACILITY_PRODUCT_CODE and return a formatted coverEndDate', async () => {
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

    const expectedCoverEndDate = moment(coverEndDate).format('DD MMM YYYY');

    const expected = [
      {
        ...mockFacilities[0],
        facilityProduct: 'BSS',
        coverEndDate: expectedCoverEndDate,
      },
      {
        ...mockFacilities[1],
        facilityProduct: 'EWCS',
        coverEndDate: expectedCoverEndDate,
      },
    ];

    expect(result).toEqual(expected);
  });
});
