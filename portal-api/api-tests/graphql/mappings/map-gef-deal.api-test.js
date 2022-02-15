const mapGefDeal = require('../../../src/graphql/mappings/map-gef-deal');
const CONSTANTS = require('../../../src/constants');

describe('/graphql mappings - map-gef-deal', () => {
  const mockDeal = {
    dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
    status: 'SUBMITTED',
    submissionType: 'Automatic inclusion notice',
    additionalRefName: 'Test',
    exporter: {},
    updatedAt: Date.now(),
  };

  it('should return mapped deal, mapping to non-GEF structure', () => {
    const result = mapGefDeal(mockDeal);

    const expected = {
      _id: mockDeal._id,
      status: mockDeal.status,
      bankRef: mockDeal.additionalRefName,
      exporter: '',
      product: mockDeal.dealType,
      submissionType: mockDeal.submissionType,
      updatedAt: mockDeal.updatedAt,
    };

    expect(result).toEqual(expected);
  });

  it('should return exporter.compayName when it exists', () => {
    mockDeal.exporter = {
      companyName: 'Test company',
    };

    const result = mapGefDeal(mockDeal);

    expect(result.exporter).toEqual(mockDeal.exporter.companyName);
  });
});
