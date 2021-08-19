const mapGefDeal = require('./map-gef-deal');
const { mapCashContingentFacility } = require('./map-cash-contingent-facility');

const MOCK_GEF_DEAL = require('../../__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../__mocks__/mock-cash-contingent-facilities');

describe('mappings - map submitted deal - mapGefDeal', () => {
  it('should return mapped deal', () => {
    const mockDeal = {
      dealSnapshot: {
        ...MOCK_GEF_DEAL,
        facilities: MOCK_CASH_CONTINGENT_FACILIIES,
      },
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
        probabilityOfDefault: Number(mockDeal.dealSnapshot.exporter.probabilityOfDefault),
      },
      maker: mockDeal.dealSnapshot.maker,
      facilities: mockDeal.dealSnapshot.facilities.map((facility) => mapCashContingentFacility(facility)),
      tfm: mockDeal.tfm,
    };

    expect(result).toEqual(expected);
  });
});
