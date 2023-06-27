import { findACBSIndustrySector } from '../../src/v1/controllers/industry-sectors.controller';

describe('findACBSIndustrySector lookup', () => {
  it('should return status code from industry sector lookup', async () => {
    const expected = {
      ukefSectorName: 'Electricity, gas, steam and air conditioning supply',
      internalNo: null,
      acbsSectorName: 'CIVIL: POWER',
      acbsIndustryName: 'GAS',
    };

    const { status, data } = await findACBSIndustrySector(35220);

    expect(status).toEqual(200);

    expect(data[0].ukefSectorName).toEqual(expected.ukefSectorName);
    expect(data[0].internalNo).toEqual(expected.internalNo);
    expect(data[0].acbsSectorName).toEqual(expected.acbsSectorName);
    expect(data[0].acbsIndustryName).toEqual(expected.acbsIndustryName);

    expect(data[0].created).toBeDefined();
    expect(data[0].updated).toBeDefined();
    expect(data[0].effectiveFrom).toBeDefined();
    expect(data[0].effectiveTo).toBeDefined();
  });
});
