import { industrySector } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { findACBSIndustrySector } from '../../src/v1/controllers/industry-sectors.controller';

describe('findACBSIndustrySector', () => {
  const invalidIndustryCodeTestCases = [0, 1, 12, 123, 1234, 0o001];

  it(`should return ${HttpStatusCode.Ok} status code from industry sector lookup with a valid industry ID`, async () => {
    // Arrange
    const expected: Array<industrySector> = [
      {
        id: 321,
        ukefSectorId: '1004',
        ukefSectorName: 'Electricity, gas, steam and air conditioning supply',
        internalNo: null,
        ukefIndustryId: '35220',
        ukefIndustryName: 'Distribution of gaseous fuels through mains',
        acbsSectorId: '3',
        acbsSectorName: 'CIVIL: POWER',
        acbsIndustryId: '0302',
        acbsIndustryName: 'GAS',
        created: '2017-04-01T00:00:00.000Z',
        updated: '2017-06-28T11:01:29.040Z',
        effectiveFrom: '2017-04-01T00:00:00.000Z',
        effectiveTo: '9999-12-31T00:00:00.000Z',
      },
    ];

    // Act
    const { status, data } = await findACBSIndustrySector(35220);

    // Assert
    const responseData = data[0] as industrySector;

    expect(status).toEqual(HttpStatusCode.Ok);

    expect(responseData.ukefSectorName).toEqual(expected[0].ukefSectorName);
    expect(responseData.internalNo).toEqual(expected[0].internalNo);
    expect(responseData.acbsSectorName).toEqual(expected[0].acbsSectorName);
    expect(responseData.acbsIndustryName).toEqual(expected[0].acbsIndustryName);

    expect(responseData.created).toBeDefined();
    expect(responseData.updated).toBeDefined();
    expect(responseData.effectiveFrom).toBeDefined();
    expect(responseData.effectiveTo).toBeDefined();
  });

  it.each(invalidIndustryCodeTestCases)(`should return a ${HttpStatusCode.BadRequest} if %s industry code is provided`, async (industryId) => {
    // Act
    const { status, data } = await findACBSIndustrySector(industryId);

    // Arrange
    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(data).toEqual('Invalid industry ID');
  });
});
