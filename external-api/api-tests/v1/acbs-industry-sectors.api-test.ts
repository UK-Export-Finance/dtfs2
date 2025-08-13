import { industrySector } from '@ukef/dtfs2-common';
import { findACBSIndustrySector } from '../../src/v1/controllers/industry-sectors.controller';

describe('findACBSIndustrySector lookup', () => {
  it('should return status code from industry sector lookup', async () => {
    const expected: Array<industrySector> = [
      {
        id: 1,
        ukefSectorId: '1001',
        ukefSectorName: 'Agriculture, Forestry and Fishing',
        internalNo: null,
        ukefIndustryId: '01110',
        ukefIndustryName: 'Growing of cereals (except rice), leguminous crops and oil seeds',
        acbsSectorId: '30',
        acbsSectorName: 'CIVIL: AGRICULTURE, HORTICULTURE & FISHERIES',
        acbsIndustryId: '3001',
        acbsIndustryName: 'AGRICULTURE, HORTICULTURE & FISHERIES',
        created: '2017-04-01T00:00:00.000Z',
        updated: '2017-06-28T11:01:29.040Z',
        effectiveFrom: '2017-04-01T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ];
    const { status, data } = await findACBSIndustrySector(35220);

    expect(status).toEqual(200);

    const responseData = data[0] as industrySector;

    expect(responseData.ukefSectorName).toEqual(expected[0].ukefSectorName);
    expect(responseData.internalNo).toEqual(expected[0].internalNo);
    expect(responseData.acbsSectorName).toEqual(expected[0].acbsSectorName);
    expect(responseData.acbsIndustryName).toEqual(expected[0].acbsIndustryName);

    expect(responseData.created).toBeDefined();
    expect(responseData.updated).toBeDefined();
    expect(responseData.effectiveFrom).toBeDefined();
    expect(responseData.effectiveTo).toBeDefined();
  });

  const invalidIndustryCodeTestCases = [1, 12, 123, 1234];

  describe('when industry id is invalid', () => {
    test.each(invalidIndustryCodeTestCases)('returns a 400 if you provide invalid industry code (5 digit)  %s', async (industryId) => {
      const { status, data } = await findACBSIndustrySector(industryId);

      expect(status).toEqual(400);
      expect(data).toEqual('Invalid industry ID');
    });
  });
});
