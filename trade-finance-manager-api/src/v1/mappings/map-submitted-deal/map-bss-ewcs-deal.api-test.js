const mapBssEwcsDeal = require('./map-bss-ewcs-deal');
const { mapBssEwcsFacility } = require('./map-bss-ewcs-facility');
const MOCK_BSS_EWCS_DEAL = require('../../__mocks__/mock-deal');

describe('mappings - map submitted deal - mapBssEwcsDeal', () => {
  it('should return mapped deal', () => {
    const mockDeal = {
      dealSnapshot: MOCK_BSS_EWCS_DEAL,
      tfm: {},
    };

    const result = mapBssEwcsDeal(mockDeal);

    const {
      _id,
      dealType,
      submissionType,
      details,
      submissionDetails,
      bondTransactions,
      loanTransactions,
      eligibility,
    } = mockDeal.dealSnapshot;

    const {
      bankSupplyContractID,
      bankSupplyContractName,
      submissionCount,
      submissionDate,
      status,
      ukefDealId,
      maker,
    } = details;

    const expected = {
      _id,
      dealType,
      submissionType,
      bankReferenceNumber: bankSupplyContractID,
      bankAdditionalReferenceName: bankSupplyContractName,
      submissionCount,
      submissionType,
      submissionDate,
      status,
      ukefDealId,
      maker,
      exporter: {
        companyName: submissionDetails['supplier-name'],
        companiesHouseRegistrationNumber: submissionDetails['supplier-companies-house-registration-number'],
      },
      buyer: {
        name: submissionDetails['buyer-name'],
        country: submissionDetails['buyer-address-country'],
      },
      indemnifier: {
        name: submissionDetails['indemnifier-name'],
      },
      dealCurrency: submissionDetails.supplyContractCurrency,
      dealValue: submissionDetails.supplyContractValue,
      destinationOfGoodsAndServices: submissionDetails.destinationOfGoodsAndServices,
      eligibility,
      facilities: [
        ...bondTransactions.items.map((facility) => ({
          ...mapBssEwcsFacility(facility),
          coverEndDate: expect.any(Object), // date object
        })),
        ...loanTransactions.items.map((facility) => ({
          ...mapBssEwcsFacility(facility),
          coverEndDate: expect.any(Object), // date object
        })),
      ],
      tfm: mockDeal.tfm,
    };

    expect(result).toEqual(expected);
  });
});
