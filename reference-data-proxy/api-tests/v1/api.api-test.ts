import { findACBSIndustrySector } from '../../src/v1/controllers/industry-sectors.controller';

describe('findACBSIndustrySector lookup', () => {
  it('should return status code from industry sector lookup', async () => {
    const expectedBody = [
      {
        ukefSectorName: 'Electricity, gas, steam and air conditioning supply',
        internalNo: null,
        acbsSectorName: 'CIVIL: POWER',
        acbsIndustryName: 'GAS',
        created: '2017-04-01T00:00:00',
        updated: '2017-06-28T11:01:29',
        effectiveFrom: '2017-04-01T00:00:00',
        effectiveTo: '9999-12-31T00:00:00',
      },
    ];
    const { status, data } = await findACBSIndustrySector(35220);
    expect(status).toEqual(200);
    expect(data).toMatchObject(expectedBody);
  });
});
