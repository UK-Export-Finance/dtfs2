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

    const responseData = data[0];

    expect(responseData.ukefSectorName).toEqual(expected.ukefSectorName);
    expect(responseData.internalNo).toEqual(expected.internalNo);
    expect(responseData.acbsSectorName).toEqual(expected.acbsSectorName);
    expect(responseData.acbsIndustryName).toEqual(expected.acbsIndustryName);

    expect(responseData.created).toBeDefined();
    expect(responseData.updated).toBeDefined();
    expect(responseData.effectiveFrom).toBeDefined();
    expect(responseData.effectiveTo).toBeDefined();
  });
});
