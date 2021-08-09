const mapGefDeal = require('./map-gef-deal');
const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');

describe('mappings - map submitted deal - mapGefDeal', () => {
  it('should return mapped deal', () => {
    const mockDeal = {
      dealSnapshot: MOCK_GEF_DEAL,
      tfm: {},
    };

    const result = mapGefDeal(mockDeal);

    const expected = {
      _id: mockDeal.dealSnapshot._id,
      dealType: mockDeal.dealSnapshot.dealType,
      bankSupplyContractID: mockDeal.dealSnapshot.bankInternalRefName,
      bankAdditionalReferenceName: mockDeal.dealSnapshot.additionalRefName,
      submissionCount: mockDeal.dealSnapshot.submissionCount,
      submissionType: mockDeal.dealSnapshot.submissionType,
      submissionDate: mockDeal.dealSnapshot.submissionDate,
      status: mockDeal.dealSnapshot.status,
      ukefDealId: mockDeal.dealSnapshot.ukefDealId,
      exporter: {
        companyName: mockDeal.dealSnapshot.exporter.companyName,
        companiesHouseRegistrationNumber: mockDeal.dealSnapshot.exporter.companiesHouseRegistrationNumber,
      },
      tfm: mockDeal.tfm,
    };

    expect(result).toEqual(expected);
  });
});
