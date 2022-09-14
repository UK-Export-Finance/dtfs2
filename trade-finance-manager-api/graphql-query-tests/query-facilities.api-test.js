const { format } = require('date-fns');
const { queryAllFacilities } = require('../src/graphql/resolvers/query-facilities');

const { CURRENCY } = require('../src/constants/currency.constant');
const api = require('../src/v1/api');

jest.mock('../src/v1/api');

describe('queryAllFacilities()', () => {
  const mockTfmFacilities = [{
    companyName: 'Auto Test 1',
    ukefFacilityId: '222',
    tfmFacilities: {
      dealId: '123',
      facilityId: '321',
      ukefFacilityId: '0030511905',
      dealType: 'BSS/EWCS',
      type: 'Bond',
      value: '500000.00',
      currency: CURRENCY.GBP,
      coverEndDate: '2022-12-08',
      companyName: 'Auto Test 1',
      hasBeenIssued: true,
    },
  }];

  beforeEach(() => {
    api.getAllFacilities = () => Promise.resolve(mockTfmFacilities);
  });

  it('should return coverEndDate formatted in facilities array if correctly formatted', async () => {
    const result = await queryAllFacilities({ params: 'test' });

    const coverEndDateExpected = format(new Date(mockTfmFacilities[0].tfmFacilities.coverEndDate), 'dd LLL yyyy');
    expect(result.tfmFacilities[0].coverEndDate).toEqual(coverEndDateExpected);
  });

  it('should return coverEndDate as string in facilities array if incorrectly formatted', async () => {
    mockTfmFacilities[0].tfmFacilities.coverEndDate = '2022-12--08';
    api.getAllFacilities = () => Promise.resolve(mockTfmFacilities);

    const result = await queryAllFacilities({ params: 'test' });

    expect(result.tfmFacilities[0].coverEndDate).toEqual('');
  });

  it('should return blank object if no query params', async () => {
    const result = await queryAllFacilities({});

    expect(result).toEqual({});
  });
});
