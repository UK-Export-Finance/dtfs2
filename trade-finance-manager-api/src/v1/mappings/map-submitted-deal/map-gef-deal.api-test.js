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

    const { dealSnapshot } = mockDeal;

    const expected = {
      _id: dealSnapshot._id,
      dealType: dealSnapshot.dealType,
      bankInternalRefName: dealSnapshot.bankInternalRefName,
      additionalRefName: dealSnapshot.additionalRefName,
      submissionCount: dealSnapshot.submissionCount,
      submissionType: dealSnapshot.submissionType,
      submissionDate: dealSnapshot.submissionDate,
      status: dealSnapshot.status,
      ukefDealId: dealSnapshot.ukefDealId,
      exporter: {
        isFinanceIncreasing: dealSnapshot.isFinanceIncreasing,
        companyName: dealSnapshot.exporter.companyName,
        companiesHouseRegistrationNumber: dealSnapshot.exporter.companiesHouseRegistrationNumber,
        probabilityOfDefault: Number(dealSnapshot.exporter.probabilityOfDefault),
        registeredAddress: dealSnapshot.exporter.registeredAddress,
        selectedIndustry: {
          name: dealSnapshot.exporter.selectedIndustry.name,
          class: dealSnapshot.exporter.selectedIndustry.class.name,
        },
        smeType: dealSnapshot.exporter.smeType,
      },
      maker: dealSnapshot.maker,
      facilities: dealSnapshot.facilities.map((facility) => mapCashContingentFacility(facility)),
      bank: {
        emails: dealSnapshot.bank.emails,
      },
      tfm: mockDeal.tfm,
    };

    expect(result).toEqual(expected);
  });
});
